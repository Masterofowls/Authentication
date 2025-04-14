import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";
import session from "express-session";
import crypto from "crypto";

// Extend SessionData with our custom properties
declare module "express-session" {
  interface SessionData {
    userId?: number;
    supabaseToken?: string;
  }
}

// Get Supabase URL and service key from environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Create Supabase client with service key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  // Register user endpoint
  app.post("/api/register", async (req, res) => {
    try {
      console.log("Registration attempt for:", req.body.email);
      
      // Validate request body using zod schema
      const validatedData = insertUserSchema.parse({
        email: req.body.email,
        password: req.body.password,
      });

      // Check if user already exists in our database
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        console.log("Email already in use:", validatedData.email);
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Register with Supabase first
      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ message: "Supabase is not configured" });
      }
      
      try {
        // For demo purposes, we'll use admin.createUser which allows us to auto-confirm emails
        const { data: supabaseData, error: supabaseError } = await supabase.auth.admin.createUser({
          email: validatedData.email,
          password: validatedData.password,
          email_confirm: true // Auto-confirm email for the demo
        });

        if (supabaseError) {
          console.error("Supabase registration error:", supabaseError.message);
          return res.status(400).json({ message: supabaseError.message });
        }

        if (!supabaseData?.user) {
          return res.status(500).json({ message: "Failed to create user in Supabase" });
        }

        console.log("Created Supabase user with ID:", supabaseData.user.id);
        
        // Once Supabase registration is successful, create user in our database
        const user = await storage.createUser({
          email: validatedData.email,
          password: validatedData.password, // Will be hashed in storage implementation
          supabaseId: supabaseData.user.id,
        });
        
        console.log("User created successfully:", validatedData.email);

        // Return the created user (without password)
        const { password, ...userWithoutPassword } = user;
        
        // Set session values
        req.session.userId = user.id;
        
        // If Supabase returned a session token, store it
        if (supabaseData.session) {
          req.session.supabaseToken = supabaseData.session.access_token;
        }
        
        // Save the session before responding
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Error during registration" });
          }
          return res.status(201).json(userWithoutPassword);
        });
      } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Server error during Supabase registration" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error during registration" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      console.log("Login attempt for:", req.body.email);
      
      // Validate login data
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });

      const validatedData = loginSchema.parse(req.body);
      
      // Verify Supabase is configured
      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ message: "Supabase is not configured" });
      }
      
      // Sign in with Supabase
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });
      
      if (supabaseError) {
        console.error("Supabase login error:", supabaseError.message);
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      if (!supabaseData?.user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log("Supabase login successful for:", validatedData.email);
      
      // Get user from our database
      let user = await storage.getUserByEmail(validatedData.email);
      
      // If user doesn't exist in our database yet but exists in Supabase,
      // create a record in our database
      if (!user && supabaseData.user) {
        user = await storage.createUser({
          email: validatedData.email,
          password: validatedData.password, // Will be hashed
          supabaseId: supabaseData.user.id,
        });
        console.log("Created user record from Supabase login:", user.id);
      }
      
      if (!user) {
        console.log("User not found:", validatedData.email);
        return res.status(401).json({ message: "User not found in database" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      
      // Set user ID and Supabase token in session
      req.session.userId = user.id;
      req.session.supabaseToken = supabaseData.session?.access_token;
      
      // Save the session before responding
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Error during login" });
        }
        return res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error during login" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req, res) => {
    // Check if session exists
    if (!req.session) {
      return res.status(200).json({ message: "Already logged out" });
    }
    
    try {
      // Logout from Supabase if we have the token
      if (req.session.supabaseToken) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Supabase logout error:", error.message);
        }
      }
      
      // Destroy the session completely
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Error during logout" });
        }
        
        // Send success response
        return res.status(200).json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Error during logout:", error);
      return res.status(500).json({ message: "Server error during logout" });
    }
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Password reset endpoint
  app.post("/api/reset-password", async (req, res) => {
    try {
      // Validate email
      const resetSchema = z.object({
        email: z.string().email(),
      });

      const { email } = resetSchema.parse(req.body);

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal that the user doesn't exist for security reasons
        return res.status(200).json({ message: "Password reset email sent if account exists" });
      }

      // Send password reset email through Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.protocol}://${req.get('host')}/auth`,
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

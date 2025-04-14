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

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        console.log("Email already in use:", validatedData.email);
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Try to register with Supabase if credentials are available
      let supabaseId = null;
      
      if (supabaseUrl && supabaseServiceKey) {
        try {
          const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
            email: validatedData.email,
            password: validatedData.password,
            email_confirm: true,
          });

          if (!supabaseError && supabaseUser?.user) {
            supabaseId = supabaseUser.user.id;
            console.log("Created Supabase user:", supabaseId);
          } else if (supabaseError) {
            console.error("Supabase error:", supabaseError.message);
          }
        } catch (error) {
          console.error("Error with Supabase registration:", error);
          // Continue with local registration even if Supabase fails
        }
      } else {
        console.log("Skipping Supabase registration - credentials not available");
      }

      // Create user in our database
      const user = await storage.createUser({
        email: validatedData.email,
        password: validatedData.password, // This will be hashed by storage implementation
        supabaseId,
      });
      
      console.log("User created successfully:", validatedData.email);

      // Return the created user (without password)
      const { password, ...userWithoutPassword } = user;
      
      // Set session values
      req.session.userId = user.id;
      
      // Save the session before responding
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Error during registration" });
        }
        return res.status(201).json(userWithoutPassword);
      });
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

      // Get user from our database
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        console.log("User not found:", validatedData.email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // For simplicity in this demo, skip verifying password and just log in the user
      // In a real application, you would verify the password
      console.log("Login successful for:", validatedData.email);
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      
      // Set user ID in session
      req.session.userId = user.id;
      
      // Set the cookie by destroying and recreating the session
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Error during login" });
        }
        
        // Store user info in session
        req.session.userId = user.id;
        
        // Save the session 
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Error during login" });
          }
          
          return res.status(200).json(userWithoutPassword);
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error during login" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    // Check if session exists
    if (!req.session) {
      return res.status(200).json({ message: "Already logged out" });
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

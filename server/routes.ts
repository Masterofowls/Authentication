import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

// Get Supabase URL and service key from environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Create Supabase client with service key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function registerRoutes(app: Express): Promise<Server> {
  // Register user endpoint
  app.post("/api/register", async (req, res) => {
    try {
      // Validate request body using zod schema
      const validatedData = insertUserSchema.parse({
        email: req.body.email,
        password: req.body.password,
      });

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Register user with Supabase
      const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
        email: validatedData.email,
        password: validatedData.password,
        email_confirm: false,
      });

      if (supabaseError) {
        return res.status(400).json({ message: supabaseError.message });
      }

      // Create user in our database
      const user = await storage.createUser({
        email: validatedData.email,
        password: validatedData.password, // This will be hashed by storage implementation
        supabaseId: supabaseUser.user.id,
      });

      // Return the created user (without password)
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
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
      // Validate login data
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });

      const validatedData = loginSchema.parse(req.body);

      // Sign in with Supabase
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (signInError) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Get user from our database
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        // Create user in our database if it exists in Supabase but not in our DB
        const newUser = await storage.createUser({
          email: validatedData.email,
          password: "supabase-managed", // Password managed by Supabase
          supabaseId: signInData.user.id,
        });
        
        const { password, ...userWithoutPassword } = newUser;
        return res.status(200).json(userWithoutPassword);
      }

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      
      // Set session cookie or token as needed
      req.session.userId = user.id;
      req.session.supabaseToken = signInData.session.access_token;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error during login" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    try {
      // Clear session
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        
        // Clear any cookies
        res.clearCookie("connect.sid");
        
        return res.status(200).json({ message: "Logged out successfully" });
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error during logout" });
    }
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    try {
      if (!req.session.userId) {
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

import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have valid Supabase credentials
const hasValidSupabaseConfig = supabaseUrl && supabaseAnonKey;

if (!hasValidSupabaseConfig) {
  console.warn('Missing Supabase credentials. Authentication will use the backend fallback.');
} else {
  console.log('Supabase credentials detected, using Supabase authentication.');
}

// Create Supabase client (will fail gracefully if credentials not available)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth related types
export type SignUpCredentials = {
  email: string;
  password: string;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

export type ResetPasswordFormData = {
  email: string;
};

export type AuthError = {
  message: string;
};

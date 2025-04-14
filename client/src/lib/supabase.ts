import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate Supabase configuration
const hasValidSupabaseConfig = supabaseUrl && supabaseAnonKey;

if (!hasValidSupabaseConfig) {
  console.error('Missing Supabase credentials. Authentication will not work properly.');
} else {
  console.log('Supabase credentials detected, using Supabase authentication.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

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

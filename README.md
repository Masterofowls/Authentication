# Supabase Authentication System

A robust web authentication system with Supabase integration, offering secure authentication flows with fallback mechanisms.

## Features

- 🔐 Complete authentication with Supabase
- 📱 Responsive mobile-friendly design
- 🚀 Secure session management
- 🔄 Password reset functionality
- ⚡ Modern UI with ShadCN and Aceternity UI components

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Express.js, Node.js
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod validation

## Setup Instructions

### Prerequisites

1. Node.js (v16+)
2. Supabase account with a project created
3. Git

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SESSION_SECRET=your_session_secret
```

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Supabase Setup

### SQL for Supabase

Run the following SQL in your Supabase SQL Editor to set up the necessary tables and policies:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a users table that references auth.users
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  supabase_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a secure policy for the users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = supabase_id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = supabase_id);

-- Function to handle user creation when a new auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (email, password, supabase_id)
  VALUES (NEW.email, 'managed-by-supabase', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a user record when a new auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

### Supabase Authentication Settings

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Configure the following settings:

   - **Site URL**: Set to your application URL (e.g., https://yourdomain.com)
   - **Redirect URLs**: Add your application URLs (e.g., https://yourdomain.com/auth)
   - **Email Auth**: Enable Email auth with "Email confirmation" disabled for development

## Architecture Overview

### Backend Architecture

The server follows a modular architecture with the following components:

1. **Express Server** (`server/index.ts`): 
   - Main entry point for the backend
   - Sets up middleware, error handling, and routes

2. **Storage Interface** (`server/storage.ts`):
   - Provides a storage abstraction layer
   - Implements methods for user management
   - Handles session storage

3. **Routes** (`server/routes.ts`):
   - Defines API endpoints for authentication
   - Implements handlers for registration, login, logout, and password reset
   - Integrates with Supabase auth services

### Authentication Flow

The application implements a dual authentication system:

1. **Primary Authentication (Supabase)**:
   - User registration uses Supabase admin API to create accounts with auto-confirmed emails
   - Login uses Supabase's signInWithPassword method
   - Session tokens from Supabase are stored in Express sessions
   - Logout invalidates both Supabase session and local session

2. **Fallback Authentication**:
   - If Supabase is unavailable, falls back to local storage
   - Includes secure password hashing with scrypt

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Creates a new user account |
| `/api/login` | POST | Authenticates a user |
| `/api/logout` | POST | Logs out a user |
| `/api/user` | GET | Retrieves the authenticated user's data |
| `/api/reset-password` | POST | Initiates a password reset |

## Frontend Structure

### Key Components

1. **AuthProvider** (`client/src/hooks/use-auth.tsx`):
   - Context provider for authentication state
   - Manages user state and auth mutations
   - Handles login, registration, and logout logic

2. **Protected Routes** (`client/src/lib/protected-route.tsx`):
   - Guards routes that require authentication
   - Redirects unauthenticated users to the login page

3. **Authentication Page** (`client/src/pages/auth-page.tsx`):
   - Implements login and registration forms
   - Displays password reset interface
   - Features responsive layout with hero section

## Security Considerations

- Express sessions secured with HTTP-only cookies
- Password hashing using scrypt with unique salts
- Session regeneration on authentication state changes
- Proper error handling with minimal information exposure
- Environment variables for sensitive configuration

## Best Practices

1. **Error Handling**:
   - Detailed server-side logging
   - User-friendly error messages on the client
   - Proper status codes for different error scenarios

2. **Performance**:
   - Efficient database queries
   - React component memoization
   - Optimized bundle size

3. **User Experience**:
   - Form validation with real-time feedback
   - Loading states during async operations
   - Clear notifications for action results

## License

MIT

---

Created by [Your Name] - Feel free to use this template for your projects!
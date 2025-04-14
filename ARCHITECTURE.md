# Authentication System Architecture

This document provides a comprehensive overview of the authentication system architecture, explaining how the various components interact and the flow of data through the system.

## System Components

### 1. Backend Components

#### Express Server (`server/index.ts`)
- Entry point for the Node.js application
- Configures middleware (CORS, body-parser, session, etc.)
- Sets up error handling
- Initializes routes

#### Storage Interface (`server/storage.ts`)
- Abstract interface for data persistence
- Implements methods for user management:
  - `getUser(id)`: Retrieves a user by ID
  - `getUserByEmail(email)`: Retrieves a user by email
  - `createUser(userData)`: Creates a new user
- Manages session storage through the session store

#### Routes (`server/routes.ts`)
- Defines API endpoints
- Handles HTTP requests for authentication operations
- Integrates with Supabase for authentication services
- Implements validation using Zod schemas

### 2. Frontend Components

#### Authentication Provider (`client/src/hooks/use-auth.tsx`)
- React context provider for authentication state
- Exposes user data and authentication methods
- Manages mutations for login, logout, and registration
- Handles error states and loading indicators

#### Protected Route Component (`client/src/lib/protected-route.tsx`)
- Higher-order component for route protection
- Redirects unauthenticated users to the login page
- Shows loading state during authentication checks

#### Query Client (`client/src/lib/queryClient.ts`)
- Configures TanStack Query for data fetching
- Sets up default options for queries and mutations
- Provides helper functions for API requests

#### Authentication Page (`client/src/pages/auth-page.tsx`)
- Implements login and registration forms
- Handles password reset functionality
- Uses React Hook Form with Zod validation

## Authentication Flow

### 1. Registration Process

```
Client                          Server                          Supabase
  │                               │                                │
  │ 1. Submit Registration Form   │                                │
  │ ────────────────────────────> │                                │
  │                               │ 2. Validate Input              │
  │                               │ ─────────────────┐             │
  │                               │ <────────────────┘             │
  │                               │                                │
  │                               │ 3. Create User in Supabase     │
  │                               │ ───────────────────────────────>
  │                               │                                │
  │                               │ <───────────────────────────────
  │                               │ 4. User Created with Auto-confirm
  │                               │                                │
  │                               │ 5. Create Local User Record    │
  │                               │ ─────────────────┐             │
  │                               │ <────────────────┘             │
  │                               │                                │
  │                               │ 6. Create Session              │
  │                               │ ─────────────────┐             │
  │                               │ <────────────────┘             │
  │                               │                                │
  │ <─────────────────────────────│                                │
  │ 7. Return User Data & Redirect│                                │
```

1. User submits registration form with email and password
2. Server validates the input using Zod schema
3. Server creates a user in Supabase using the admin.createUser method with email_confirm=true
4. Supabase creates the user with email pre-confirmed
5. Server creates a corresponding user record in the local database
6. Server creates a session with user ID and Supabase token
7. User data is returned to the client, and the user is redirected to the protected area

### 2. Login Process

```
Client                          Server                          Supabase
  │                               │                                │
  │ 1. Submit Login Form          │                                │
  │ ────────────────────────────> │                                │
  │                               │ 2. Validate Input              │
  │                               │ ─────────────────┐             │
  │                               │ <────────────────┘             │
  │                               │                                │
  │                               │ 3. Authenticate with Supabase  │
  │                               │ ───────────────────────────────>
  │                               │                                │
  │                               │ <───────────────────────────────
  │                               │ 4. Authentication Result       │
  │                               │                                │
  │                               │ 5. Retrieve Local User         │
  │                               │ ─────────────────┐             │
  │                               │ <────────────────┘             │
  │                               │                                │
  │                               │ 6. Create Session              │
  │                               │ ─────────────────┐             │
  │                               │ <────────────────┘             │
  │                               │                                │
  │ <─────────────────────────────│                                │
  │ 7. Return User Data & Redirect│                                │
```

1. User submits login form with email and password
2. Server validates the input using Zod schema
3. Server authenticates with Supabase using signInWithPassword
4. Supabase returns authentication result (success or failure)
5. On success, server retrieves the corresponding user from the local database
6. Server creates a session with user ID and Supabase token
7. User data is returned to the client, and the user is redirected to the protected area

### 3. Session Verification

```
Client                          Server                          
  │                               │                                
  │ 1. Request Protected Resource │                                
  │ ────────────────────────────> │                                
  │                               │ 2. Check Session               
  │                               │ ─────────────────┐             
  │                               │ <────────────────┘             
  │                               │                                
  │                               │ 3. Retrieve User from Storage  
  │                               │ ─────────────────┐             
  │                               │ <────────────────┘             
  │                               │                                
  │ <─────────────────────────────│                                
  │ 4. Return Protected Resource  │                                
  │    or 401 Unauthorized        │                                
```

1. Client requests a protected resource or API endpoint
2. Server checks for a valid session
3. Server retrieves the user data from storage based on session ID
4. Server returns the protected resource or a 401 Unauthorized response

### 4. Logout Process

```
Client                          Server                          Supabase
  │                               │                                │
  │ 1. Request Logout             │                                │
  │ ────────────────────────────> │                                │
  │                               │ 2. Sign Out from Supabase      │
  │                               │ ───────────────────────────────>
  │                               │                                │
  │                               │ <───────────────────────────────
  │                               │ 3. Supabase Signout Complete   │
  │                               │                                │
  │                               │ 4. Destroy Local Session       │
  │                               │ ─────────────────┐             │
  │                               │ <────────────────┘             │
  │                               │                                │
  │ <─────────────────────────────│                                │
  │ 5. Return Success & Redirect  │                                │
```

1. User requests to log out
2. Server signs out from Supabase to invalidate the Supabase session
3. Supabase completes the sign-out process
4. Server destroys the local session
5. Success response is returned to the client, and the user is redirected to the login page

## Security Considerations

### 1. Password Security
- Passwords are never stored in plain text
- Server uses scrypt with unique salts for local password hashing
- Supabase handles password security for Supabase-managed users

### 2. Session Security
- Sessions are stored securely using HTTP-only cookies
- Session IDs are randomly generated and cryptographically secure
- Sessions expire after a configurable period of inactivity

### 3. Authentication Token Handling
- Supabase tokens are stored in the server-side session, not exposed to the client
- Tokens are automatically refreshed by Supabase when needed

### 4. CORS and CSRF Protection
- CORS is configured to restrict access to approved origins
- CSRF protection is implemented for all state-changing operations

## Fallback Mechanism

The system implements a fallback mechanism in case Supabase authentication is unavailable:

1. If Supabase is not configured or returns an error:
   - The system falls back to local authentication
   - Passwords are securely hashed using scrypt
   - Local sessions are used for authentication

2. Recovery path when Supabase becomes available again:
   - Users created locally can be migrated to Supabase
   - Sessions are upgraded to use Supabase tokens

## Data Flow

### 1. User Data Flow

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  React Client  │◄───►│  Express API   │◄───►│    Storage     │
│                │     │                │     │                │
└────────────────┘     └───────┬────────┘     └────────────────┘
                               │
                               ▼
                       ┌────────────────┐
                       │                │
                       │    Supabase    │
                       │                │
                       └────────────────┘
```

- React client communicates with Express API
- Express API handles business logic and authentication
- Storage interface abstracts the data persistence layer
- Supabase provides authentication services

### 2. Authentication State Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Auth Provider  │◄───►│ React Query     │◄───►│  Express API    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │                                               │
       ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│                 │                           │                 │
│  Protected      │                           │     Session     │
│  Components     │                           │     Store       │
│                 │                           │                 │
└─────────────────┘                           └─────────────────┘
```

- Auth Provider manages the authentication state in the client
- React Query handles API requests and caching
- Express API validates sessions and manages authentication
- Session Store persists session data
- Protected Components use the authentication state for access control

## Conclusion

This authentication system provides a robust, secure, and flexible solution for web applications. By integrating with Supabase for primary authentication while maintaining a fallback mechanism, the system ensures high availability and reliability.

The clear separation of concerns between the client and server components makes the system maintainable and extensible, allowing for future enhancements and integrations with additional authentication providers if needed.
# Hive Authentication Package API Reference

## Overview

The Hive Authentication Package provides a flexible, callback-based authentication system for Hive blockchain applications. The package handles Hive blockchain authentication while allowing your app to handle server authentication through callbacks.

## Core Concepts

### Authentication Flow

1. **Hive Authentication** (Package handles)
   - User enters Hive username
   - Package authenticates with Hive blockchain via Aioha
   - Returns `HiveAuthResult` object

2. **Server Authentication** (Your app handles)
   - Package calls your callback function with Hive result
   - Your app makes API call to your server
   - Your app returns server response as JSON string
   - Package stores encrypted data and triggers events

3. **Data Storage** (Package handles)
   - All user data encrypted with AES
   - Stored in localStorage
   - Never contains plain text data

## Components

### `AuthButton`

The main authentication button component.

**Props**: None

**Behavior**:
- Shows "Login" if no user is logged in
- Shows user avatar if logged in
- Opens login modal or switch user modal on click

**Example**:
```tsx
import { AuthButton } from 'hive-authentication';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <AuthButton />
    </div>
  );
}
```

### `LoginDialog`

Modal dialog for user login.

**Props**:
```tsx
interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}
```

**Example**:
```tsx
import { LoginDialog } from 'hive-authentication';

function MyLogin() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LoginDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      showBackButton={false}
    />
  );
}
```

### `SwitchUserModal`

Modal for managing multiple logged-in users.

**Props**:
```tsx
interface SwitchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features**:
- Lists all logged-in users with avatars
- Shows current user with "Current" badge
- Allows switching between users
- Individual logout for each user
- "Add Account" button to add new users
- "Logout All" to clear all accounts

**Example**:
```tsx
import { SwitchUserModal } from 'hive-authentication';

function UserManagement() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SwitchUserModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}
```

## Store & Hooks

### `useAuthStore()`

Zustand store for authentication state management.

**State**:
```tsx
interface AuthStore {
  currentUser: LoggedInUser | null;
  loggedInUsers: LoggedInUser[];
  isLoading: boolean;
  error: string | null;
}
```

**Actions**:
```tsx
// Set current user
setCurrentUser: (user: LoggedInUser | null) => void;

// Add user to logged-in users
addLoggedInUser: (user: LoggedInUser) => void;

// Remove user
removeLoggedInUser: (username: string) => void;

// Clear all users
clearAllUsers: () => void;

// Set loading state
setLoading: (loading: boolean) => void;

// Set error state
setError: (error: string | null) => void;

// Authenticate with callback
authenticateWithCallback: (
  hiveResult: HiveAuthResult,
  callback: (hiveResult: HiveAuthResult) => Promise<string>
) => Promise<void>;
```

**Example**:
```tsx
import { useAuthStore } from 'hive-authentication';

function MyComponent() {
  const { 
    currentUser, 
    loggedInUsers, 
    isLoading, 
    authenticateWithCallback 
  } = useAuthStore();

  const handleLogin = async (username: string) => {
    try {
      await authenticateWithCallback(
        hiveResult,
        async (hiveResult) => {
          // Your server authentication logic here
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challenge: hiveResult.challenge,
              username: hiveResult.username,
              pubkey: hiveResult.publicKey,
              proof: hiveResult.proof,
            }),
          });

          if (!response.ok) {
            throw new Error('Server authentication failed');
          }

          const data = await response.json();
          return JSON.stringify(data);
        }
      );
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {currentUser ? (
        <p>Welcome, {currentUser.username}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

## Event System

### `addAuthEventListener(listener)`

Listen to authentication state changes.

**Event Types**:
- `login`: User logged in
- `logout`: User logged out
- `user_switch`: User switched
- `user_add`: User added to list
- `user_remove`: User removed from list

**Event Object**:
```tsx
interface AuthEvent {
  type: AuthEventType;
  user?: LoggedInUser;
  previousUser?: LoggedInUser;
}
```

**Example**:
```tsx
import { addAuthEventListener } from 'hive-authentication';
import { useEffect } from 'react';

function MyApp() {
  useEffect(() => {
    const unsubscribe = addAuthEventListener((event) => {
      switch (event.type) {
        case 'login':
          console.log('User logged in:', event.user);
          // Update your app state, show welcome message, etc.
          break;
          
        case 'logout':
          console.log('User logged out:', event.previousUser);
          // Clear app state, redirect to login, etc.
          break;
          
        case 'user_switch':
          console.log('User switched from', event.previousUser?.username, 'to', event.user?.username);
          // Update UI, refresh user-specific data, etc.
          break;
          
        case 'user_add':
          console.log('New user added:', event.user?.username);
          // Update user list, show notification, etc.
          break;
          
        case 'user_remove':
          console.log('User removed:', event.user?.username);
          // Update user list, show notification, etc.
          break;
      }
    });
    
    // Cleanup listener on unmount
    return unsubscribe;
  }, []);
  
  return <div>Your app content</div>;
}
```

## Services

### `AuthService`

Static service class for Hive blockchain authentication.

**Methods**:
```tsx
// Initialize Aioha
static async initialize(): Promise<void>;

// Login with Hive blockchain
static async loginWithHive(username: string): Promise<HiveAuthResult>;

// Complete login flow using callback
static async completeLogin(
  username: string,
  callback: (hiveResult: HiveAuthResult) => Promise<string>
): Promise<HiveAuthResult & { serverResponse: string }>;
```

**Example**:
```tsx
import { AuthService } from 'hive-authentication';

async function loginUser(username: string) {
  try {
    // Initialize Aioha
    await AuthService.initialize();
    
    // Get Hive authentication result
    const hiveResult = await AuthService.loginWithHive(username);
    
    console.log('Hive auth result:', hiveResult);
    
    // Now you can use this with authenticateWithCallback
    // or handle server authentication yourself
    
  } catch (error) {
    console.error('Hive authentication failed:', error);
  }
}
```

## Types

### `HiveAuthResult`

Result from Hive blockchain authentication.

```tsx
interface HiveAuthResult {
  provider: string;      // Authentication provider (e.g., 'keychain')
  challenge: string;     // Hash from Hive authentication
  publicKey: string;     // User's public key
  username: string;      // Hive username
  proof: string;         // Timestamp used for authentication
}
```

### `LoggedInUser`

Complete user data after authentication.

```tsx
interface LoggedInUser {
  username: string;
  provider: string;
  challenge: string;
  publicKey: string;
  proof: string;
  serverResponse: string; // JSON string from your server
}
```

### `ServerAuthResponse`

**Deprecated**: This type is no longer used in the callback-based system.

```tsx
interface ServerAuthResponse {
  token: string;
  type: string;
}
```

## Advanced Usage

### Custom Server Authentication

```tsx
import { useAuthStore } from 'hive-authentication';

function MyApp() {
  const { authenticateWithCallback } = useAuthStore();

  const handleLogin = async (username: string) => {
    try {
      await authenticateWithCallback(
        // Hive result will be provided by the package
        hiveResult,
        // Your callback function
        async (hiveResult) => {
          // Make your API call
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challenge: hiveResult.challenge,
              username: hiveResult.username,
              pubkey: hiveResult.publicKey,
              proof: hiveResult.proof,
            }),
          });

          if (!response.ok) {
            throw new Error('Server authentication failed');
          }

          const data = await response.json();
          
          // Return your server response as JSON string
          return JSON.stringify(data);
        }
      );
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <AuthButton />;
}
```

### Environment Variables

```bash
# Required: Encryption key for local storage
VITE_LOCAL_KEY=your-secure-encryption-key
```

## Migration from v0.0.5

If you're upgrading from the previous version that had hardcoded server authentication:

1. **Remove hardcoded API calls**: The package no longer calls `https://beta-api.distriator.com/login`
2. **Implement callback-based authentication**: Use `authenticateWithCallback` with your own server logic
3. **Update event handling**: The event system remains the same
4. **Update types**: `LoggedInUser` now has `serverResponse` instead of `token` and `type`

### Before (v0.0.5):
```tsx
// Old way - package handled server authentication
const user = await AuthService.completeLogin(username);
```

### After (v0.0.6+):
```tsx
// New way - your app handles server authentication
await authenticateWithCallback(
  hiveResult,
  async (hiveResult) => {
    // Your server authentication logic
    const response = await fetch('/api/login', { /* ... */ });
    const data = await response.json();
    return JSON.stringify(data);
  }
);
```

## Error Handling

The package provides comprehensive error handling:

- **Hive Authentication Errors**: Thrown when blockchain authentication fails
- **Callback Errors**: Thrown when your callback function fails
- **Storage Errors**: Handled gracefully with fallbacks
- **Network Errors**: Your app handles these in the callback

## Best Practices

1. **Always handle errors**: Wrap authentication calls in try-catch blocks
2. **Clean up listeners**: Unsubscribe from event listeners on component unmount
3. **Secure encryption key**: Use a strong `VITE_LOCAL_KEY` in production
4. **Validate server responses**: Ensure your callback returns valid JSON strings
5. **Handle loading states**: Use the `isLoading` state from the store
6. **Test with multiple users**: Verify the multi-user functionality works correctly

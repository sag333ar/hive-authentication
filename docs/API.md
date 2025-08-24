# Hive Authentication API Reference

## Overview

The Hive Authentication package provides a complete solution for authenticating users with the Hive blockchain. It includes a beautiful UI built with daisyUI and Tailwind CSS, secure state management with Zustand, and comprehensive authentication services.

## Components

### AuthButton

The main authentication button component that handles login/logout functionality.

#### Props

None - this is a self-contained component.

#### Usage

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

#### Behavior

- **Not Logged In**: Shows "Login" button
- **Logged In**: Shows user avatar and username
- **Click Action**: 
  - Not logged in: Opens login dialog
  - Logged in: Logs out the user

### LoginDialog

A modal dialog for user authentication.

#### Props

```tsx
interface LoginDialogProps {
  isOpen: boolean;      // Controls dialog visibility
  onClose: () => void;  // Callback when dialog closes
}
```

#### Usage

```tsx
import { LoginDialog } from 'hive-authentication';

function CustomLogin() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Custom Login</button>
      <LoginDialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
```

## Hooks

### useAuthStore

Zustand store hook for authentication state management.

#### Returns

```tsx
{
  currentUser: LoggedInUser | null;
  loggedInUsers: LoggedInUser[];
  setCurrentUser: (user: LoggedInUser | null) => void;
  addLoggedInUser: (user: LoggedInUser) => void;
  removeLoggedInUser: (username: string) => void;
  clearAllUsers: () => void;
}
```

#### Usage

```tsx
import { useAuthStore } from 'hive-authentication';

function UserProfile() {
  const { currentUser, setCurrentUser } = useAuthStore();
  
  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  if (!currentUser) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {currentUser.username}!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## Services

### AuthService

Static service class for authentication operations.

#### Methods

##### `completeLogin(username: string): Promise<LoggedInUser>`

Performs the complete authentication flow:
1. Hive blockchain authentication
2. Server authentication
3. Returns complete user object

```tsx
import { AuthService } from 'hive-authentication';

async function handleCustomLogin(username: string) {
  try {
    const user = await AuthService.completeLogin(username);
    console.log('Login successful:', user);
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

##### `loginWithHive(username: string): Promise<HiveAuthResult>`

Authenticates with Hive blockchain only.

```tsx
import { AuthService } from 'hive-authentication';

async function hiveOnlyLogin(username: string) {
  try {
    const result = await AuthService.loginWithHive(username);
    console.log('Hive auth result:', result);
    return result;
  } catch (error) {
    console.error('Hive auth failed:', error);
    throw error;
  }
}
```

##### `authenticateWithServer(challenge: string, username: string, pubkey: string, proof: string): Promise<ServerAuthResponse>`

Authenticates with the server API.

```tsx
import { AuthService } from 'hive-authentication';

async function serverAuth(challenge: string, username: string, pubkey: string, proof: string) {
  try {
    const response = await AuthService.authenticateWithServer(
      challenge, username, pubkey, proof
    );
    console.log('Server auth response:', response);
    return response;
  } catch (error) {
    console.error('Server auth failed:', error);
    throw error;
  }
}
```

**Note**: The `challenge` field should contain the hash returned from Hive authentication, and the `proof` field should contain the timestamp used during Hive authentication.

## Types

### LoggedInUser

Complete user information after successful authentication.

```tsx
interface LoggedInUser {
  username: string;      // Hive username
  provider: string;      // Authentication provider (keychain, hiveauth, etc.)
  challenge: string;     // Challenge message used for authentication
  publicKey: string;     // User's public key
  proof: string;         // Proof of authentication
  token: string;         // JWT token from server
  type: string;          // User type (admin, guide, owner, user)
}
```

### HiveAuthResult

Result from Hive blockchain authentication.

```tsx
interface HiveAuthResult {
  provider: string;      // Authentication provider
  result: any;           // Raw result from aioha
  publicKey: string;     // User's public key
  username: string;      // Hive username
}
```

### ServerAuthResponse

Response from server authentication.

```tsx
interface ServerAuthResponse {
  token: string;         // JWT token
  type: 'admin' | 'guide' | 'owner' | 'user';  // User type
}
```

### AuthStore

Zustand store interface.

```tsx
interface AuthStore {
  currentUser: LoggedInUser | null;
  loggedInUsers: LoggedInUser[];
  setCurrentUser: (user: LoggedInUser | null) => void;
  addLoggedInUser: (user: LoggedInUser) => void;
  removeLoggedInUser: (username: string) => void;
  clearAllUsers: () => void;
}
```

## Configuration

### Environment Variables

Set `VITE_LOCAL_KEY` for AES encryption of local storage data:

```env
VITE_LOCAL_KEY=your-secret-encryption-key
```

### Tailwind CSS

The package uses Tailwind CSS with daisyUI. Make sure your project has Tailwind CSS configured.

### DaisyUI

The package includes daisyUI components. No additional configuration needed.

## Error Handling

All authentication methods throw errors that can be caught and handled:

```tsx
try {
  const user = await AuthService.completeLogin(username);
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error('Authentication failed:', error.message);
    // Handle specific error
  } else {
    console.error('Unknown error occurred');
    // Handle unknown error
  }
}
```

## Security Features

- **AES Encryption**: All local storage data is encrypted
- **Secure Storage**: Uses encrypted localStorage for persistence
- **Token Management**: JWT tokens are securely stored
- **Provider Validation**: Validates authentication providers

## Browser Support

- Modern browsers with ES6+ support
- LocalStorage support required
- CryptoJS compatibility

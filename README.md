# Hive Authentication Package

A React.js package for Hive blockchain authentication with a flexible callback-based server authentication system.

## Features

- 🔐 **Hive Blockchain Authentication**: Login with HiveKeychain, HiveAuth, or Private Posting Key
- 🎯 **Flexible Server Integration**: Your app handles server authentication via callbacks
- 👥 **Multi-User Support**: Switch between multiple logged-in accounts
- 🔒 **Secure Storage**: All data encrypted with AES encryption
- 📱 **Responsive Design**: Mobile-first design with DaisyUI components
- 🎨 **Theme Independent**: Works with any project's theme
- 📡 **Event System**: Listen to authentication state changes

## Installation

```bash
npm install hive-authentication
```

## Quick Start

### 1. Import CSS

```tsx
import 'hive-authentication/build.css';
```

### 2. Use the Auth Button

```tsx
import { AuthButton, useAuthStore, addAuthEventListener } from 'hive-authentication';

function App() {
  // Listen to authentication events
  useEffect(() => {
    const unsubscribe = addAuthEventListener((event) => {
      switch (event.type) {
        case 'login':
          console.log('User logged in:', event.user);
          break;
        case 'logout':
          console.log('User logged out:', event.previousUser);
          break;
        case 'user_switch':
          console.log('User switched to:', event.user);
          break;
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      <h1>My App</h1>
      <AuthButton />
    </div>
  );
}
```

## How It Works

### 1. **Hive Authentication** (Package handles)
- User enters Hive username
- Package authenticates with Hive blockchain via Aioha
- Returns Hive authentication result

### 2. **Server Authentication** (Your app handles)
- Package calls your callback function with Hive result
- Your app makes API call to your server
- Your app returns server response as JSON string
- Package stores encrypted data and triggers events

### 3. **Data Storage** (Package handles)
- All user data encrypted with AES
- Stored in localStorage
- Never contains plain text data

## API Reference

### Components

#### `AuthButton`
The main authentication button component.

**Props**: None

**Behavior**:
- Shows "Login" if no user is logged in
- Shows user avatar if logged in
- Opens login modal or switch user modal on click

#### `LoginDialog`
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

#### `SwitchUserModal`
Modal for managing multiple logged-in users.

**Props**:
```tsx
interface SwitchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Store

#### `useAuthStore()`
Zustand store for authentication state.

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

### Events

#### `addAuthEventListener(listener)`
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

### Types

#### `HiveAuthResult`
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

#### `LoggedInUser`
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

## Examples

See the [examples](./examples/) folder for complete usage examples.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

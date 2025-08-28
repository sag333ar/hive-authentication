# Hive Authentication

A React package for Hive blockchain authentication with a simple callback-based API and Zustand state management.

## Installation

```bash
npm install hive-authentication
```

## Quick Start

### 1. Import CSS

```tsx
import 'hive-authentication/build.css';
```

### 2. Use the Auth Button with Callback

```tsx
import { AuthButton, useAuthStore } from 'hive-authentication';

function App() {
  const { currentUser, loggedInUsers } = useAuthStore();

  // Subscribe to store changes using Zustand
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      console.log('Store state changed:', state);
    });

    return unsubscribe;
  }, []);

  // Your authentication callback - works for both login AND adding accounts
  const handleAuthenticate = async (hiveResult) => {
    // Make your API call here
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
  };

  return (
    <div>
      <h1>My App</h1>
      <AuthButton onAuthenticate={handleAuthenticate} />
      
      {currentUser && (
        <p>Welcome, {currentUser.username}!</p>
      )}
    </div>
  );
}
```

## How It Works

1. **User clicks login** → Package shows login modal
2. **User enters username** → Package authenticates with Hive blockchain
3. **Package calls your callback** → Your app makes API call to your server
4. **Your app returns result** → Package stores the data and updates state
5. **If callback fails** → Package automatically logs out the user

**Important**: The same callback function is used for:
- **Initial login** (when user first logs in)
- **Adding accounts** (when user clicks "Add Account" in the switch user modal)

This ensures consistent authentication flow for all user operations.

## State Management

The package uses Zustand for state management. You can access the authentication state directly:

```tsx
const { currentUser, loggedInUsers, isLoading, error } = useAuthStore();
```

### State Properties

- `currentUser`: Currently logged-in user (or null)
- `loggedInUsers`: Array of all logged-in users
- `isLoading`: Whether authentication is in progress
- `error`: Any error message (or null)

### Subscribing to Changes

Use Zustand's built-in subscription to react to state changes:

```tsx
useEffect(() => {
  const unsubscribe = useAuthStore.subscribe((state) => {
    // React to any state changes
    console.log('Auth state changed:', state);
  });

  return unsubscribe;
}, []);
```

## API Reference

### Components

#### `AuthButton`
The main authentication button.

**Props:**
```tsx
interface AuthButtonProps {
  onAuthenticate?: (hiveResult: HiveAuthResult) => Promise<string>;
}
```

**Usage:**
```tsx
<AuthButton onAuthenticate={handleAuthenticate} />
```

### Store

#### `useAuthStore()`
Access authentication state and actions.

**State:**
```tsx
const { currentUser, loggedInUsers, isLoading, error } = useAuthStore();
```

**Note**: The store provides read-only access to state. All modifications are handled internally by the package.

### Types

```tsx
interface HiveAuthResult {
  provider: string;      // 'keychain'
  challenge: string;     // Hive signature
  publicKey: string;     // User's public key
  username: string;      // Hive username
  proof: string;         // Timestamp
}

interface LoggedInUser extends HiveAuthResult {
  serverResponse: string; // Your server response
}
```

## Environment Variables

```bash
# Required: Encryption key for local storage
VITE_LOCAL_KEY=your-secure-encryption-key
```

## License

MIT

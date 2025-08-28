# Hive Authentication

A React package for Hive blockchain authentication with a simple callback-based API.

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

  // Your authentication callback
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
    </div>
  );
}
```

## How It Works

1. **User clicks login** → Package shows login modal
2. **User enters username** → Package authenticates with Hive blockchain
3. **Package calls your callback** → Your app makes API call to your server
4. **Your app returns result** → Package stores the data and triggers events
5. **If callback fails** → Package automatically logs out the user

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

### Events

#### `addAuthEventListener(listener)`
Listen to authentication state changes.

**Event Types:**
- `login` - User logged in
- `logout` - User logged out  
- `user_switch` - User switched
- `user_add` - User added to list
- `user_remove` - User removed from list

**Usage:**
```tsx
const unsubscribe = addAuthEventListener((event) => {
  console.log('Auth event:', event.type, event.user);
});

// Clean up
unsubscribe();
```

### Store

#### `useAuthStore()`
Access authentication state and actions.

**State:**
```tsx
const { currentUser, loggedInUsers, isLoading, error } = useAuthStore();
```

**Actions:**
```tsx
const { setCurrentUser, removeLoggedInUser, clearAllUsers } = useAuthStore();
```

## Types

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

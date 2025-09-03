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

import { initAioha } from '@aioha/aioha'
import { AiohaProvider } from '@aioha/react-provider'

const aioha = initAioha(
  {
    hivesigner: {
      app: 'hive-auth-demo.app',
      callbackURL: window.location.origin + '/hivesigner.html',
      scope: ['login', 'vote']
    },
    hiveauth: {
      name: 'Hive Authentication Demo',
      description: 'A demo app for testing Hive authentication'
    }
  }
)

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
    <AiohaProvider aioha={aioha}>
      <div>
        <h1>My App</h1>
          <AuthButton 
            onAuthenticate={handleAuthenticate}
            hiveauth={{
              name: 'My Hive App',
              description: 'A Hive blockchain application'
            }}
            hivesigner={{
              app: 'myapp.app',
              callbackURL: window.location.origin + '/hivesigner.html',
              scope: ['login', 'vote']
            }}
          />
          
          {currentUser && (
            <p>Welcome, {currentUser.username}!</p>
          )}
      </div>
    </AiohaProvider>
  );
}
```

**Note**: Both configurations are required even if you only plan to use one provider. This ensures the Aioha library is properly initialized with all necessary settings.

**HiveAuth Support**: The package now fully supports HiveAuth login! When using HiveAuth:

1. **Event Listening**: The package automatically listens for `hiveauth_login_request` events from the Aioha library
2. **QR Code Display**: When a HiveAuth login request is received, a QR code is displayed for the user to scan
3. **Wallet Integration**: Users can scan the QR code with their HiveAuth wallet app to approve the login
4. **Automatic Handling**: The package handles the entire flow from login request to authentication completion

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

## HiveAuth Login Flow

When a user chooses HiveAuth login:

1. **Login Request**: User clicks "Login with HiveAuth" button
2. **Event Emission**: Aioha library emits a `hiveauth_login_request` event
3. **Form Hiding**: Login form (username input and buttons) is automatically hidden
4. **QR Code Generation**: Package generates a QR code from the HiveAuth payload
5. **QR Code Display**: Large, scannable QR code is displayed with 30-second countdown timer
6. **Wallet Scan**: User scans QR code with their HiveAuth wallet app
7. **Wallet Approval**: User approves the login in their wallet
8. **Authentication Complete**: Package receives the authentication result and proceeds with your callback
9. **Timer Expiry**: If 30 seconds pass without approval, QR code expires and login form reappears

**Key Features:**
- **Automatic Form Hiding**: Login form disappears when QR code is shown
- **Real QR Code**: Actual QR code generated from HiveAuth payload (not placeholder)
- **30-Second Timer**: Countdown timer with automatic expiry
- **Cancel Option**: User can manually cancel QR code display
- **Seamless UX**: Smooth transition between login form and QR code display

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

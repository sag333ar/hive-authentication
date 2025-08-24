# Hive Authentication

A React package for Hive blockchain authentication with a beautiful daisyUI-based interface.

## Features

- 🔐 Hive blockchain authentication using @aioha/aioha
- 🎨 Beautiful UI components built with daisyUI and Tailwind CSS
- 📱 Mobile-responsive design with bottom-up modals
- 🔒 **Secure encrypted storage** - No plain text data in localStorage
- 👥 **Multi-user support** - Switch between multiple accounts
- 🔄 **Switch User Modal** - Easy account management
- 🚀 Built with Vite and TypeScript
- 📦 Zero-configuration setup

## Installation

```bash
npm install hive-authentication
```

## Usage

### Basic Setup

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

### Advanced Usage with Custom State Management

```tsx
import { AuthButton, useAuthStore, AuthService } from 'hive-authentication';

function App() {
  const { currentUser, loggedInUsers } = useAuthStore();
  
  const handleCustomLogin = async (username: string) => {
    try {
      const user = await AuthService.completeLogin(username);
      // Custom logic after login
      console.log('User logged in:', user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <div>
      <h1>My App</h1>
      <AuthButton />
      
      {currentUser && (
        <div>
          <p>Welcome, {currentUser.username}!</p>
          <p>User Type: {currentUser.type}</p>
        </div>
      )}
    </div>
  );
}
```

### Event-Driven Authentication State Handling

The package provides an event system to handle authentication state changes:

```tsx
import { addAuthEventListener } from 'hive-authentication';
import { useEffect } from 'react';

function MyApp() {
  useEffect(() => {
    // Listen to authentication events
    const unsubscribe = addAuthEventListener((event) => {
      switch (event.type) {
        case 'login':
          console.log('User logged in:', event.user?.username);
          // Update your app state, show welcome message, etc.
          break;
          
        case 'logout':
          console.log('User logged out:', event.previousUser?.username);
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
          console.log('User removed:', event.username);
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

### SwitchUserModal

A modal for managing multiple logged-in accounts:

- **User List**: Shows all logged-in users with avatars and types
- **Current User**: Highlights the active user with "Current" badge
- **Switch Users**: Click on any user to switch to that account
- **Logout Individual**: Logout specific users (except current)
- **Add Account**: Add new accounts without closing the modal
- **Logout All**: Clear all accounts and return to login state

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

## Components

### AuthButton

The main authentication button that:
- Shows "Login" when no user is logged in
- Shows user avatar and username when logged in
- Opens login dialog on click when not authenticated
- Handles logout when clicked while authenticated

### LoginDialog

A modal dialog that:
- Accepts Hive username input
- Shows real-time avatar preview
- Provides login method selection (HiveKeychain, HiveAuth, Private Key)
- Handles authentication flow

## API

### AuthService

Static methods for authentication:

- `AuthService.completeLogin(username: string)`: Complete login flow
- `AuthService.loginWithHive(username: string)`: Hive blockchain authentication
- `AuthService.authenticateWithServer(...)`: Server authentication

### useAuthStore

Zustand store for state management:

- `currentUser`: Currently logged-in user
- `loggedInUsers`: Array of all logged-in users
- `setCurrentUser(user)`: Set current user
- `addLoggedInUser(user)`: Add user to logged-in users
- `removeLoggedInUser(username)`: Remove user
- `clearAllUsers()`: Clear all users

### addAuthEventListener

Event listener for authentication state changes:

- `addAuthEventListener(callback)`: Listen to auth events
- Returns unsubscribe function for cleanup
- Events: `login`, `logout`, `user_switch`, `user_add`, `user_remove`

## Types

```tsx
interface LoggedInUser {
  username: string;
  provider: string;
  challenge: string;
  publicKey: string;
  proof: string;
  token: string;
  type: string;
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

## Practical Examples

### Handling Auth State Changes in Your App

When using the `AuthButton` in your app, you can listen to authentication events to update your UI:

```tsx
// my-page-x.tsx
import React, { useEffect, useState } from 'react';
import { AuthButton, addAuthEventListener, useAuthStore } from 'hive-authentication';

function MyPageX() {
  const { currentUser } = useAuthStore();
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // Listen to authentication events
    const unsubscribe = addAuthEventListener((event) => {
      switch (event.type) {
        case 'login':
          console.log('User logged in:', event.user?.username);
          // Load user-specific data
          loadUserData(event.user?.username);
          break;
          
        case 'logout':
          console.log('User logged out');
          // Clear user data, redirect, etc.
          setUserData(null);
          // Maybe redirect to login page
          break;
          
        case 'user_switch':
          console.log('User switched to:', event.user?.username);
          // Load data for the new user
          loadUserData(event.user?.username);
          break;
      }
    });
    
    // Load initial data if user is already logged in
    if (currentUser) {
      loadUserData(currentUser.username);
    }
    
    return unsubscribe;
  }, [currentUser]);
  
  const loadUserData = async (username: string) => {
    if (!username) return;
    
    try {
      // Load user-specific data from your API
      const response = await fetch(`/api/user/${username}/data`);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };
  
  return (
    <div>
      {/* Your app content */}
      <div className="user-info">
        {currentUser ? (
          <p>Welcome, {currentUser.username}!</p>
        ) : (
          <p>Please log in</p>
        )}
      </div>
      
      {/* Auth button in top right corner */}
      <div className="auth-button">
        <AuthButton />
      </div>
      
      {/* Display user data */}
      {userData && (
        <div className="user-data">
          {/* Your user-specific content */}
        </div>
      )}
    </div>
  );
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build package
npm run build

# Preview build
npm run preview
```

## License

MIT

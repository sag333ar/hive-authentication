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

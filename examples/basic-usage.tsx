import React, { useEffect, useState } from 'react';
import { 
  AuthButton, 
  useAuthStore, 
  addAuthEventListener,
  type AuthEvent 
} from 'hive-authentication';

// Basic usage example
export function BasicExample() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hive Authentication Example</h1>
      <AuthButton />
    </div>
  );
}

// Advanced usage with state management
export function AdvancedExample() {
  const { currentUser, loggedInUsers, isLoading } = useAuthStore();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Advanced Usage</h1>
      
      {isLoading && (
        <div className="alert alert-info mb-4">
          <span>Loading...</span>
        </div>
      )}
      
      {currentUser ? (
        <div className="card bg-base-100 shadow-xl mb-4">
          <div className="card-body">
            <h2 className="card-title">Welcome, {currentUser.username}!</h2>
            <p>Provider: {currentUser.provider}</p>
            <p>Public Key: {currentUser.publicKey.substring(0, 20)}...</p>
            <p>Total Logged In Users: {loggedInUsers.length}</p>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning mb-4">
          <span>No user logged in</span>
        </div>
      )}
      
      <AuthButton />
    </div>
  );
}

// Event-driven example
export function EventDrivenExample() {
  const [events, setEvents] = useState<AuthEvent[]>([]);
  const { currentUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = addAuthEventListener((event) => {
      setEvents(prev => [...prev, event]);
      
      switch (event.type) {
        case 'login':
          console.log('User logged in:', event.user);
          // You can update your app state here
          break;
          
        case 'logout':
          console.log('User logged out:', event.previousUser);
          // Clear app state, redirect, etc.
          break;
          
        case 'user_switch':
          console.log('User switched from', event.previousUser?.username, 'to', event.user?.username);
          // Refresh user-specific data
          break;
          
        case 'user_add':
          console.log('New user added:', event.user?.username);
          // Update user list, show notification
          break;
          
        case 'user_remove':
          console.log('User removed:', event.user?.username);
          // Update user list, show notification
          break;
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Event-Driven Example</h1>
      
      <div className="mb-4">
        <AuthButton />
      </div>
      
      {currentUser && (
        <div className="alert alert-success mb-4">
          <span>Current User: {currentUser.username}</span>
        </div>
      )}
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Authentication Events</h2>
          <div className="max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-gray-500">No events yet. Try logging in/out to see events.</p>
            ) : (
              events.map((event, index) => (
                <div key={index} className="border-b border-gray-200 py-2">
                  <div className="font-semibold text-blue-600">{event.type}</div>
                  {event.user && (
                    <div className="text-sm text-gray-600">
                      User: {event.user.username}
                    </div>
                  )}
                  {event.previousUser && (
                    <div className="text-sm text-gray-600">
                      Previous: {event.previousUser.username}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom server authentication example
export function CustomServerAuthExample() {
  const { authenticateWithCallback, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCustomLogin = async () => {
    if (!username.trim()) return;
    
    setError(null);
    
    try {
      await authenticateWithCallback(
        // This would normally come from AuthService.loginWithHive()
        // For demo purposes, we'll create a mock result
        {
          provider: 'keychain',
          challenge: 'mock-challenge-hash',
          publicKey: 'STM89YZxyG45dGMMVD3MXmwC5giNs3di2XSJVYSgXcd9FDAq1Zf6y',
          username: username.trim(),
          proof: new Date().toISOString()
        },
        // Your custom server authentication callback
        async (hiveResult) => {
          console.log('Hive authentication result:', hiveResult);
          console.log('Now calling your server API...');
          
          // This is where you would make your API call
          // For demo purposes, we'll simulate an API call
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
          
          // Simulate your server response
          const mockServerResponse = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            type: 'user',
            userId: '12345',
            permissions: ['read', 'write'],
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          };
          
          // Return your server response as a JSON string
          return JSON.stringify(mockServerResponse);
        }
      );
      
      setUsername('');
      alert('Login successful! Check the console for details.');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Custom Server Authentication</h1>
      
      <div className="card bg-base-100 shadow-xl mb-4">
        <div className="card-body">
          <h2 className="card-title">Custom Login Flow</h2>
          <p className="mb-4">
            This example shows how to implement your own server authentication
            while using the package's Hive blockchain authentication.
          </p>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Hive Username</span>
            </label>
            <input
              type="text"
              placeholder="Enter username"
              className="input input-bordered"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomLogin()}
              disabled={isLoading}
            />
          </div>
          
          <button
            className="btn btn-primary mt-4 w-full"
            onClick={handleCustomLogin}
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Authenticating...
              </>
            ) : (
              'Login with Custom Server Auth'
            )}
          </button>
          
          {error && (
            <div className="alert alert-error mt-4">
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Standard Auth Button</h2>
          <p className="mb-4">
            The standard AuthButton still works and will use the same
            callback-based system internally.
          </p>
          <AuthButton />
        </div>
      </div>
    </div>
  );
}

// CSS import example
export function CSSImportExample() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CSS Import Example</h1>
      
      <div className="alert alert-info mb-4">
        <span>
          Make sure you've imported the CSS file: <code>import 'hive-authentication/build.css';</code>
        </span>
      </div>
      
      <p className="mb-4">
        This example shows the package working with its pre-built CSS file.
        The styles are designed to work with any project's theme.
      </p>
      
      <AuthButton />
    </div>
  );
}

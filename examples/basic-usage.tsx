import React from 'react';
import { AuthButton, useAuthStore } from 'hive-authentication';

// Example 1: Basic usage
export const BasicExample: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hive Authentication Example</h1>
      <AuthButton />
    </div>
  );
};

// Example 2: Advanced usage with state management
export const AdvancedExample: React.FC = () => {
  const { currentUser, loggedInUsers } = useAuthStore();
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Advanced Example</h1>
      
      <div className="mb-4">
        <AuthButton />
      </div>
      
      {currentUser && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Current User</h2>
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>Provider:</strong> {currentUser.provider}</p>
            <p><strong>Type:</strong> {currentUser.type}</p>
            <p><strong>Public Key:</strong> {currentUser.publicKey.substring(0, 20)}...</p>
          </div>
        </div>
      )}
      
      {loggedInUsers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">All Logged In Users</h3>
          <div className="space-y-2">
            {loggedInUsers.map((user) => (
              <div key={user.username} className="badge badge-outline">
                {user.username} ({user.type})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Example 3: Custom styling
export const CustomStylingExample: React.FC = () => {
  return (
    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Custom Styled App
        </h1>
        
        <div className="card bg-white/90 backdrop-blur-sm">
          <div className="card-body text-center">
            <h2 className="card-title justify-center mb-4">Welcome!</h2>
            <p className="text-gray-600 mb-6">
              This is a custom styled example of the Hive Authentication package.
            </p>
            <div className="card-actions justify-center">
              <AuthButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

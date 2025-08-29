import React, { useEffect } from 'react';
import { AuthButton, useAuthStore } from 'hive-authentication';
import 'hive-authentication/build.css';

function App() {
  const { currentUser, loggedInUsers } = useAuthStore();

  // Your authentication callback - this is where you make your API call
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Hive Authentication Demo</h1>
      
      <div className="mb-8">
        <AuthButton onAuthenticate={handleAuthenticate} hiveauth={{
          name: 'HiveAuth',
          description: 'HiveAuth',
          icon: 'https://images.hive.blog/u/sagarkothari88/avatar'
        }} hivesigner={{
          app: 'HiveSigner',
        }} />
      </div>

      {currentUser && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            Currently Logged In
          </h2>
          <p className="text-green-700">
            Username: {currentUser.username}
          </p>
          <p className="text-green-700">
            Provider: {currentUser.provider}
          </p>
          <p className="text-green-700">
            Server Response: {currentUser.serverResponse}
          </p>
        </div>
      )}

      {loggedInUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            All Logged In Users ({loggedInUsers.length})
          </h2>
          <div className="space-y-2">
            {loggedInUsers.map((user) => (
              <div key={user.username} className="text-blue-700">
                • {user.username} ({user.provider})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click the Login button above</li>
          <li>Enter a Hive username</li>
          <li>Package authenticates with Hive blockchain</li>
          <li>Package calls your callback with Hive result</li>
          <li>Your callback makes API call to your server</li>
          <li>If successful, user is logged in. If failed, user is logged out</li>
        </ol>
      </div>
    </div>
  );
}

export default App;

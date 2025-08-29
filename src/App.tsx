import { useEffect } from 'react';
import { AuthButton } from './components/AuthButton';
import { useAuthStore } from './store/authStore';
import type { HiveAuthResult, LoggedInUser } from './types/auth';
import './App.css';

function App() {
  const { currentUser, loggedInUsers } = useAuthStore();

  // Example of how to subscribe to store changes using Zustand
  useEffect(() => {
    let previousUser = currentUser;
    
    // Subscribe to store changes
    const unsubscribe = useAuthStore.subscribe((state) => {
      const currentUser = state.currentUser;
      
      // Detect login/logout/user switch
      if (currentUser && !previousUser) {
        console.log('User logged in:', currentUser);
      } else if (!currentUser && previousUser) {
        console.log('User logged out:', previousUser);
      } else if (currentUser && previousUser && currentUser.username !== previousUser.username) {
        console.log('User switched to:', currentUser);
      }
      
      previousUser = currentUser;
    });

    return unsubscribe;
  }, [currentUser]);

  // Sample API implementation - this is what developers should implement
  const handleAuthenticate = async (hiveResult: HiveAuthResult): Promise<string> => {
    console.log('Hive authentication result:', hiveResult);
    
    try {
      // Make API call to your server
      const response = await fetch('https://beta-api.distriator.com/login2', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          'User-Agent': navigator.userAgent,
          'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"'
        },
        body: JSON.stringify({
          challenge: hiveResult.challenge,
          username: hiveResult.username,
          pubkey: hiveResult.publicKey,
          proof: hiveResult.proof
        })
      });

      if (!response.ok) {
        throw new Error(`Server authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Server response:', data);
      
      // Return your server response as JSON string
      return JSON.stringify(data);
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl">Hive Authentication Demo</h2>
            <p className="text-base-content/70">
              This is a demo of the Hive Authentication package with a working API integration.
            </p>
            <div className="card-actions justify-center mt-4">
              <AuthButton 
                onAuthenticate={handleAuthenticate}
                hiveauth={{
                  name: 'Hive Authentication Demo',
                  description: 'A demo app for testing Hive authentication'
                }}
                hivesigner={{
                  app: 'hive-auth-demo.app',
                  callbackURL: window.location.origin + '/hivesigner.html',
                  scope: ['login', 'vote']
                }}
              />
            </div>
          </div>
        </div>

        {/* Current User Info */}
        {currentUser && (
          <div className="card bg-green-50 border border-green-200 mb-6">
            <div className="card-body">
              <h3 className="card-title text-green-800">Currently Logged In</h3>
              <div className="space-y-2 text-green-700">
                <p><strong>Username:</strong> {currentUser.username}</p>
                <p><strong>Provider:</strong> {currentUser.provider}</p>
                <p><strong>Public Key:</strong> {currentUser.publicKey.substring(0, 20)}...</p>
                <p><strong>Server Response:</strong> {currentUser.serverResponse}</p>
              </div>
            </div>
          </div>
        )}

        {/* All Users List */}
        {loggedInUsers.length > 0 && (
          <div className="card bg-blue-50 border border-blue-200 mb-6">
            <div className="card-body">
              <h3 className="card-title text-blue-800">
                All Logged In Users ({loggedInUsers.length})
              </h3>
              <div className="space-y-2">
                {loggedInUsers.map((user: LoggedInUser) => (
                  <div key={user.username} className="text-blue-700 flex items-center gap-2">
                    <span>•</span>
                    <span>{user.username}</span>
                    <span className="text-blue-500">({user.provider})</span>
                    {currentUser?.username === user.username && (
                      <span className="badge badge-primary badge-sm">Current</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">How It Works</h3>
            <div className="text-sm text-base-content/70 space-y-2">
              <ol className="list-decimal list-inside space-y-1">
                <li>Click the Login button above</li>
                <li>Enter a Hive username</li>
                <li>Package authenticates with Hive blockchain</li>
                <li>Package calls your callback with Hive result</li>
                <li>Your callback makes API call to your server</li>
                <li>If successful, user is logged in. If failed, user is logged out</li>
              </ol>
              
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <h4 className="font-semibold mb-2">Sample API Implementation:</h4>
                <p className="text-xs font-mono">
                  The callback in this demo makes a POST request to{' '}
                  <code className="bg-base-300 px-1 rounded">https://beta-api.distriator.com/login</code>
                </p>
                <p className="text-xs mt-1">
                  Check the browser console to see the full request/response flow.
                </p>
              </div>

              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <h4 className="font-semibold mb-2">State Management:</h4>
                <p className="text-xs">
                  Use <code className="bg-base-300 px-1 rounded">useAuthStore()</code> to access{' '}
                  <code className="bg-base-300 px-1 rounded">currentUser</code> and{' '}
                  <code className="bg-base-300 px-1 rounded">loggedInUsers</code>.
                </p>
                <p className="text-xs mt-1">
                  Subscribe to changes using <code className="bg-base-300 px-1 rounded">useAuthStore.subscribe()</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

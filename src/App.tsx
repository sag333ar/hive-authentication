import { useEffect } from 'react';
import { AuthButton } from './components/AuthButton';
import { useAuthStore } from './store/authStore';
import type { HiveAuthResult } from './types/auth';

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
  const { currentUser } = useAuthStore();

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
      const response = await fetch('https://beta-api.distriator.com/login', {
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
    <AiohaProvider aioha={aioha}>
      <AuthButton
        onAuthenticate={handleAuthenticate}
        aioha={aioha}
        shouldShowSwitchUser={false}
      />
    </AiohaProvider>
  );
}

export default App;

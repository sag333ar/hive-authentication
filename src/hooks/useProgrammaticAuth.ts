import { useCallback } from 'react';
import { ProgrammaticAuth } from '../services/programmaticAuth';
import type { Aioha } from '@aioha/aioha';
import type { HiveAuthResult, LoggedInUser } from '../types/auth';
import { AuthService } from '../services/authService';

/**
 * Hook for programmatic authentication
 * Provides easy-to-use methods for programmatic login without UI components
 * 
 * @param aioha - The Aioha instance
 * @returns Object with programmatic auth methods
 * 
 * @example
 * ```typescript
 * import { useProgrammaticAuth } from 'hive-authentication';
 * 
 * function MyComponent() {
 *   const { loginWithPrivateKey, logout, getCurrentUser } = useProgrammaticAuth(aioha);
 *   
 *   const handleLogin = async () => {
 *     try {
 *       const user = await loginWithPrivateKey('username', '5J...');
 *       console.log('Logged in:', user.username);
 *     } catch (error) {
 *       console.error('Login failed:', error.message);
 *     }
 *   };
 *   
 *   return (
 *     <button onClick={handleLogin}>
 *       Login Programmatically
 *     </button>
 *   );
 * }
 * ```
 */
export function useProgrammaticAuth(aioha: Aioha) {
  const programmaticAuth = new ProgrammaticAuth(aioha);

  const loginWithPrivateKey = useCallback(
    async (
      username: string,
      privatePostingKey: string,
      serverCallback?: (hiveResult: HiveAuthResult) => Promise<string>
    ): Promise<LoggedInUser> => {
      const currentLoggedInUser = aioha.getCurrentUser();
      const otherLogins = aioha.getOtherLogins();
      if (currentLoggedInUser === username.trim()) {
        aioha.logout();
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (otherLogins && otherLogins[username.trim()]) {
        AuthService.removeUser(aioha, username.trim());
      }
      return programmaticAuth.loginWithPrivateKey(username, privatePostingKey, serverCallback);
    },
    [programmaticAuth]
  );

  return {
    loginWithPrivateKey,
  };
}

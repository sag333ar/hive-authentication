import { useCallback } from 'react';
import { ProgrammaticAuth } from '../services/programmaticAuth';
import type { Aioha } from '@aioha/aioha';
import type { HiveAuthResult, LoggedInUser } from '../types/auth';

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
      return programmaticAuth.loginWithPrivateKey(username, privatePostingKey, serverCallback);
    },
    [programmaticAuth]
  );

  return {
    loginWithPrivateKey,
  };
}

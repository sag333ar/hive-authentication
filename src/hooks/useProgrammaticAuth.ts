import { useCallback } from 'react';
import { ProgrammaticAuth } from '../services/programmaticAuth';
import type { Aioha } from '@aioha/aioha';
import type { HiveAuthResult, LoggedInUser } from '../types/auth';
import { AuthService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

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
 *   const { loginWithPrivateKey, logout, logoutAll, getCurrentUser } = useProgrammaticAuth(aioha);
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
 *   const handleLogout = async () => {
 *     try {
 *       await logout();
 *       console.log('Logged out');
 *     } catch (error) {
 *       console.error('Logout failed:', error.message);
 *     }
 *   };
 *
 *   const handleLogoutAll = async () => {
 *     try {
 *       await logoutAll();
 *       console.log('All users logged out');
 *     } catch (error) {
 *       console.error('Logout all failed:', error.message);
 *     }
 *   };
 *   
 *   return (
 *     <>
 *       <button onClick={handleLogin}>
 *         Login Programmatically
 *       </button>
 *       <button onClick={handleLogout}>
 *         Logout
 *       </button>
 *       <button onClick={handleLogoutAll}>
 *         Logout All
 *       </button>
 *     </>
 *   );
 * }
 * ```
 */
export function useProgrammaticAuth(aioha: Aioha) {
  const programmaticAuth = new ProgrammaticAuth(aioha);
  const { removeLoggedInUser } = useAuthStore();

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

  const logout = useCallback(async () => {
    const currentUser = aioha.getCurrentUser();
    if (currentUser) {
      removeLoggedInUser(currentUser);
      AuthService.logout(aioha);
    }
  }, [aioha, removeLoggedInUser]);

  const logoutAll = useCallback(async () => {
    try {
      await aioha.logout();
      // Get all other logged in users
      const otherLogins = aioha.getOtherLogins();
      // Logout each user one by one
      for (const user of Object.keys(otherLogins)) {
        AuthService.removeUser(aioha, user);
      }
      // Clear app state / storage
      const { clearAllUsers } = useAuthStore.getState();
      await clearAllUsers();
    } catch (error) {
      console.error("Error logging out all users:", error);
    }
  }, [aioha]);

  return {
    loginWithPrivateKey,
    logout,
    logoutAll,
  };
}

import { initAioha, KeyTypes, Providers } from '@aioha/aioha';
import type { HiveAuthResult } from '../types/auth';

export class AuthService {
  private static aioha: ReturnType<typeof initAioha> | null = null;

  static async initialize(config?: any): Promise<void> {
    if (!this.aioha) {
      this.aioha = await initAioha(config || {});
    }
  }

  static async loginWithHive(username: string): Promise<HiveAuthResult> {
    // Auto-initialize if not already initialized
    if (!this.aioha) {
      await this.initialize();
    }

    // Double-check that initialization was successful
    if (!this.aioha) {
      throw new Error('Failed to initialize Aioha');
    }

    try {
      // Create timestamp for proof
      const timestamp = new Date().toISOString();
      
      // Login with Hive blockchain
      const result = await this.aioha.login(Providers.Keychain, username, { msg: timestamp, keyType: KeyTypes.Posting });
      
      if (!result.success) {
        // Logout on authentication failure
        await this.logout();
        throw new Error(result.error || 'Hive authentication failed');
      }

      return {
        provider: 'keychain',
        challenge: result.result, // Signature result from Hive authentication
        publicKey: result.publicKey || '', // Handle optional publicKey
        username: username,
        proof: timestamp // Original timestamp as proof
      };
    } catch (error) {
      console.error('Hive authentication error:', error);
      // Logout on any authentication error
      await this.logout();
      throw new Error('Failed to authenticate with Hive blockchain');
    }
  }

  // Logout the current authenticated user
  static async logout(): Promise<void> {
    // Auto-initialize if not already initialized
    if (!this.aioha) {
      await this.initialize();
    }

    // Double-check that initialization was successful
    if (!this.aioha) {
      console.warn('Failed to initialize Aioha for logout');
      return;
    }

    try {
      await this.aioha.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Remove a specific user from Aioha provider
  static async removeUser(username: string): Promise<unknown> {
    // Auto-initialize if not already initialized
    if (!this.aioha) {
      await this.initialize();
    }

    // Double-check that initialization was successful
    if (!this.aioha) {
      throw new Error('Failed to initialize Aioha');
    }

    try {
      const result = this.aioha.removeOtherLogin(username);
      return result;
    } catch (error) {
      console.error('Remove user error:', error);
      throw new Error(`Failed to remove user ${username}`);
    }
  }

  // Note: Server authentication is now handled by the dev's callback
  // This method is kept for backward compatibility but deprecated
  static async authenticateWithServer(): Promise<unknown> {
    console.warn('authenticateWithServer is deprecated. Use the callback-based approach instead.');
    throw new Error('Server authentication should be handled by your app\'s callback function');
  }

  // Complete login flow using callback
  static async completeLogin(
    username: string,
    callback: (hiveResult: HiveAuthResult) => Promise<string>
  ): Promise<HiveAuthResult & { serverResponse: string }> {
    // Get Hive authentication result
    const hiveResult = await this.loginWithHive(username);
    
    // Call the dev's callback for server authentication
    const serverResponse = await callback(hiveResult);
    
    // Return the complete result for the store to handle
    return {
      ...hiveResult,
      serverResponse
    };
  }
}


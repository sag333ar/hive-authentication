import { initAioha, KeyTypes, Providers } from '@aioha/aioha';
import type { HiveAuthResult } from '../types/auth';

export class AuthService {
  private static aioha: any = null;

  static async initialize(): Promise<void> {
    if (!this.aioha) {
      this.aioha = await initAioha();
    }
  }

  static async loginWithHive(username: string): Promise<HiveAuthResult> {
    if (!this.aioha) {
      throw new Error('Aioha not initialized. Call initialize() first.');
    }

    try {
      // Create timestamp for proof
      const timestamp = new Date().toISOString();
      
      // Login with Hive blockchain
      const result = await this.aioha.login(Providers.Keychain, username, { msg: timestamp, keyType: KeyTypes.Posting });
      
      if (!result.success) {
        throw new Error(result.error || 'Hive authentication failed');
      }

      return {
        provider: 'keychain',
        challenge: result.hash, // Hash from Hive authentication
        publicKey: result.publicKey,
        username: username,
        proof: timestamp // Original timestamp as proof
      };
    } catch (error) {
      console.error('Hive authentication error:', error);
      throw new Error('Failed to authenticate with Hive blockchain');
    }
  }

  // Note: Server authentication is now handled by the dev's callback
  // This method is kept for backward compatibility but deprecated
  static async authenticateWithServer(): Promise<any> {
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


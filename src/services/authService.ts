import { Aioha, KeyTypes, Providers } from '@aioha/aioha';
import type { HiveAuthResult } from '../types/auth';


export class AuthService {

  static async loginWithHiveKeychain(aioha: Aioha, username: string): Promise<HiveAuthResult> {
    try {
      // Create timestamp for proof
      const timestamp = new Date().toISOString();
      
      // Login with Hive blockchain using Keychain
      const result = await aioha.login(Providers.Keychain, username, { msg: timestamp, keyType: KeyTypes.Posting });
      
      if (!result.success) {
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
      throw new Error('Failed to authenticate with Hive blockchain');
    }
  }

  static async loginWithHiveAuth(aioha: Aioha, username: string): Promise<HiveAuthResult> {
    
    try {
      // Create timestamp for proof
      const timestamp = new Date().toISOString();
      
      // Login with Hive blockchain using HiveAuth
      const result = await aioha.login(Providers.HiveAuth, username, { 
        msg: timestamp, 
        keyType: KeyTypes.Posting
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Hive authentication failed');
      }

      return {
        provider: 'hiveauth',
        challenge: result.result, // Signature result from Hive authentication
        publicKey: result.publicKey || '', // Handle optional publicKey
        username: username,
        proof: timestamp // Original timestamp as proof
      };
    } catch (error) {
      console.error('Hive authentication error:', error);
      throw new Error('Failed to authenticate with Hive blockchain');
    }
  }

  // Logout the current authenticated user
  static async logout(aioha: Aioha): Promise<void> {
    try {
      await aioha.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Remove a specific user from Aioha provider
  static async removeUser(aioha: Aioha, username: string): Promise<unknown> {
    try {
      const result = aioha.removeOtherLogin(username);
      return result;
    } catch (error) {
      console.error('Remove user error:', error);
      throw new Error(`Failed to remove user ${username}`);
    }
  }

  static switchUser(aioha: Aioha, username: string) {
    try {
      aioha.switchUser(username);
    } catch (error) {
      console.error('Switch user error:', error);
      throw new Error(`Failed to switch user to ${username}`);
    }
  }
}


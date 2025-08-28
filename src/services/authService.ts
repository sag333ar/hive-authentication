import { initAioha, KeyTypes, Providers } from '@aioha/aioha';
import type { HiveAuthResult, AiohaConfig, HiveAuthEvent } from '../types/auth';

export class AuthService {
  private static aioha: ReturnType<typeof initAioha> | null = null;
  private static config: AiohaConfig | null = null;
  private static hiveAuthCallback: ((event: HiveAuthEvent) => void) | null = null;

  static async initialize(config: AiohaConfig, onHiveAuthRequest?: (event: HiveAuthEvent) => void): Promise<void> {
    if (!this.aioha) {
      this.config = config;
      this.hiveAuthCallback = onHiveAuthRequest || null;
      this.aioha = await initAioha(config);
      
      // Set up event listener for HiveAuth events
      if (typeof window !== 'undefined') {
        window.addEventListener('message', this.handleHiveAuthEvent.bind(this));
      }
    }
  }

  private static handleHiveAuthEvent(event: MessageEvent): void {
    // Check if this is a HiveAuth event
    if (event.data && event.data.type === 'hiveauth_login_request') {
      const hiveAuthEvent: HiveAuthEvent = {
        type: 'hiveauth_login_request',
        payload: event.data.payload,
        username: event.data.username || 'unknown'
      };
      
      // Call the callback if provided
      if (this.hiveAuthCallback) {
        this.hiveAuthCallback(hiveAuthEvent);
      }
    }
  }

  static async loginWithHiveKeychain(username: string): Promise<HiveAuthResult> {
    // Check if already initialized
    if (!this.aioha) {
      throw new Error('Aioha not initialized. Call initialize() with configuration first.');
    }

    try {
      // Create timestamp for proof
      const timestamp = new Date().toISOString();
      
      // Login with Hive blockchain using Keychain
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

  static async loginWithHiveAuth(username: string): Promise<HiveAuthResult> {
    // Check if already initialized
    if (!this.aioha) {
      throw new Error('Aioha not initialized. Call initialize() with configuration first.');
    }

    // Check if HiveAuth is configured
    if (!this.config?.hiveauth) {
      throw new Error('HiveAuth not configured. Please provide hiveauth configuration.');
    }

    try {
      // Create timestamp for proof
      const timestamp = new Date().toISOString();
      
      // Login with Hive blockchain using HiveAuth
      const result = await this.aioha.login(Providers.HiveAuth, username, { 
        msg: timestamp, 
        keyType: KeyTypes.Posting
      });
      
      if (!result.success) {
        // Logout on authentication failure
        await this.logout();
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
      // Logout on any authentication error
      await this.logout();
      throw new Error('Failed to authenticate with Hive blockchain');
    }
  }

  // Logout the current authenticated user
  static async logout(): Promise<void> {
    // Check if already initialized
    if (!this.aioha) {
      console.warn('Aioha not initialized for logout');
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
    // Check if already initialized
    if (!this.aioha) {
      throw new Error('Aioha not initialized. Call initialize() with configuration first.');
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
}


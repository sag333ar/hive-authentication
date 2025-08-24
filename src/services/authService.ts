import { initAioha, KeyTypes, Providers } from '@aioha/aioha';
import type { HiveAuthResult, ServerAuthResponse, LoggedInUser } from '../types/auth';

const aioha = initAioha();

export class AuthService {
  static async loginWithHive(username: string): Promise<HiveAuthResult> {
    const timestamp = new Date().toISOString(); // Current timestamp as proof
    
    try {
      const result = await aioha.login(Providers.Keychain, username, {
        msg: timestamp,
        keyType: KeyTypes.Posting,
        loginTitle: 'Login with Hive',
      });

      if (!result.success) {
        console.error('Hive login failed:', result.error);
        throw new Error(result.error);
      }

      return {
        provider: 'keychain',
        challenge: result.result || '',  // This should be the hash from Hive auth
        publicKey: result.publicKey || '',
        username: result.username || username,
        proof: timestamp,  // This is the timestamp we sent
      };
    } catch (error) {
      console.error('Hive login failed:', error);
      throw new Error('Hive authentication failed');
    }
  }

  static async authenticateWithServer(
    challenge: string,
    username: string,
    pubkey: string,
    proof: string
  ): Promise<ServerAuthResponse> {
    try {
      const response = await fetch('https://beta-api.distriator.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://distriator.com/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          challenge,
          username,
          pubkey,
          proof,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server authentication failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        token: data.token,
        type: data.type,
      };
    } catch (error) {
      console.error('Server authentication failed:', error);
      throw new Error('Server authentication failed');
    }
  }

  static async completeLogin(username: string): Promise<LoggedInUser> {
    try {
      // Step 1: Login with Hive
      const hiveResult = await this.loginWithHive(username);

      // Step 2: Authenticate with server
      const serverResult = await this.authenticateWithServer(
        hiveResult.challenge,  // The hash from Hive auth
        hiveResult.username,
        hiveResult.publicKey,
        hiveResult.proof,      // The timestamp
      );

      // Step 3: Create complete user object
      const user: LoggedInUser = {
        username,
        provider: hiveResult.provider,
        challenge: hiveResult.challenge,
        publicKey: hiveResult.publicKey,
        proof: hiveResult.proof,
        token: serverResult.token,
        type: serverResult.type,
      };

      return user;
    } catch (error) {
      console.error('Complete login failed:', error);
      throw error;
    }
  }
}

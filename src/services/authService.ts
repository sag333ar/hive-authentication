import { initAioha, Providers } from '@aioha/aioha';
import type { HiveAuthResult, ServerAuthResponse, LoggedInUser } from '../types/auth';

const aioha = initAioha();

export class AuthService {
  static async loginWithHive(username: string): Promise<HiveAuthResult> {
    const challenge = new Date().toISOString(); // Current timestamp as proof
    
    try {
      const result = await aioha.login(Providers.Keychain, username, {
        msg: challenge,
      });
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      return {
        provider: 'keychain',
        result: result,
        publicKey: result.publicKey || '',
        username: result.username || username,
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
      const response = await fetch('https://beta-api.distriator.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        hiveResult.result.msg || new Date().toISOString(), // challenge
        username,
        hiveResult.publicKey,
        hiveResult.result.msg || new Date().toISOString() // proof (same as challenge)
      );
      
      // Step 3: Create complete user object
      const user: LoggedInUser = {
        username,
        provider: hiveResult.provider,
        challenge: hiveResult.result.msg || new Date().toISOString(),
        publicKey: hiveResult.publicKey,
        proof: hiveResult.result.msg || new Date().toISOString(),
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

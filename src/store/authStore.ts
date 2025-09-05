import { create } from 'zustand';
import CryptoJS from 'crypto-js';
import type { AuthStore, LoggedInUser } from '../types/auth';

// Encryption/Decryption helpers
const encryptData = (data: unknown): string => {
  const key = import.meta.env.VITE_LOCAL_KEY || 'default-key';
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

const decryptData = (encryptedData: string): unknown => {
  try {
    const key = import.meta.env.VITE_LOCAL_KEY || 'default-key';
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
};

// Clean up old storage keys
const cleanupOldStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('hive-auth-encrypted');
  }
};

// Initialize state from localStorage
const initializeState = (): { currentUser: LoggedInUser | null; loggedInUsers: LoggedInUser[] } => {
  if (typeof window === 'undefined') return { currentUser: null, loggedInUsers: [] };
  
  try {
    const encryptedUsers = localStorage.getItem('logged-in-users');
    const encryptedCurrentUser = localStorage.getItem('logged-in-user');
    
    const users = encryptedUsers ? decryptData(encryptedUsers) : [];
    const currentUser = encryptedCurrentUser ? decryptData(encryptedCurrentUser) : null;
    
    // Type guard to ensure we have the correct types
    const typedUsers = Array.isArray(users) ? users.filter((user): user is LoggedInUser => 
      user && typeof user === 'object' && 'username' in user
    ) : [];
    
    const typedCurrentUser = currentUser && typeof currentUser === 'object' && 'username' in currentUser 
      ? currentUser as LoggedInUser 
      : null;
    
    return { currentUser: typedCurrentUser, loggedInUsers: typedUsers };
  } catch (error) {
    console.error('Failed to initialize auth state:', error);
    return { currentUser: null, loggedInUsers: [] };
  }
};

export const useAuthStore = create<AuthStore>((set, get) => {
  // Initialize state
  const initialState = initializeState();
  cleanupOldStorage();
  
  return {
    ...initialState,
    isLoading: false,
    error: null,
    hiveAuthPayload: null,
    setHiveAuthPayload: (payload) => set({ hiveAuthPayload: payload }),
    setLoading: (loading) => set({ isLoading: loading }),
    
    setError: (error) => set({ error }),
    
    setCurrentUser: (user) => {
      // Encrypt and store
      if (user) {
        const encryptedUser = encryptData(user);
        localStorage.setItem('logged-in-user', encryptedUser);
      } else {
        localStorage.removeItem('logged-in-user');
      }
      
      set({ currentUser: user });
    },
    
    addLoggedInUser: (user) => {
      const { loggedInUsers } = get();
      const updatedUsers = [...loggedInUsers.filter(u => u.username !== user.username), user];
      
      // Encrypt and store
      const encryptedUsers = encryptData(updatedUsers);
      localStorage.setItem('logged-in-users', encryptedUsers);
      
      set({ loggedInUsers: updatedUsers });
    },
    
    removeLoggedInUser: async (username) => {
      const { loggedInUsers, currentUser } = get();
      const updatedUsers = loggedInUsers.filter(u => u.username !== username);
      
      // Encrypt and store
      const encryptedUsers = encryptData(updatedUsers);
      localStorage.setItem('logged-in-users', encryptedUsers);
      
      // If removing current user, clear current user
      if (currentUser?.username === username) {
        localStorage.removeItem('logged-in-user');
        set({ currentUser: null, loggedInUsers: updatedUsers });
      } else {
        set({ loggedInUsers: updatedUsers });
      }
    },
    
    clearAllUsers: async () => {

      localStorage.removeItem('logged-in-users');
      localStorage.removeItem('logged-in-user');
      set({ currentUser: null, loggedInUsers: [] });
    },
    
    authenticateWithCallback: async (hiveResult, callback) => {
      set({ isLoading: true, error: null });
      
      try {
        // Call the dev's callback function
        const serverResponse = await callback(hiveResult);
        
        // Create the complete user object
        const user: LoggedInUser = {
          username: hiveResult.username,
          provider: hiveResult.provider,
          challenge: hiveResult.challenge,
          publicKey: hiveResult.publicKey,
          proof: hiveResult.proof,
          serverResponse,
          privatePostingKey: hiveResult.privatePostingKey,
        };
        
        // Add to store
        get().addLoggedInUser(user);
        get().setCurrentUser(user);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        set({ error: errorMessage });

        throw error;
      } finally {
        set({ isLoading: false });
      }
    }
  };
});

import { create } from 'zustand';
import CryptoJS from 'crypto-js';
import type { AuthStore, LoggedInUser, AuthEvent, AuthEventListener } from '../types/auth';

// Event system
const listeners: AuthEventListener[] = [];

const emitEvent = (event: AuthEvent) => {
  listeners.forEach(listener => listener(event));
};

export const addAuthEventListener = (listener: AuthEventListener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// Encryption/Decryption helpers
const encryptData = (data: any): string => {
  const key = import.meta.env.VITE_LOCAL_KEY || 'default-key';
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

const decryptData = (encryptedData: string): any => {
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
const initializeState = () => {
  if (typeof window === 'undefined') return { currentUser: null, loggedInUsers: [] };
  
  try {
    const encryptedUsers = localStorage.getItem('logged-in-users');
    const encryptedCurrentUser = localStorage.getItem('logged-in-user');
    
    const users = encryptedUsers ? decryptData(encryptedUsers) : [];
    const currentUser = encryptedCurrentUser ? decryptData(encryptedCurrentUser) : null;
    
    return { currentUser, loggedInUsers: users || [] };
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
    
    setLoading: (loading) => set({ isLoading: loading }),
    
    setError: (error) => set({ error }),
    
    setCurrentUser: (user) => {
      const previousUser = get().currentUser;
      
      // Encrypt and store
      if (user) {
        const encryptedUser = encryptData(user);
        localStorage.setItem('logged-in-user', encryptedUser);
      } else {
        localStorage.removeItem('logged-in-user');
      }
      
      set({ currentUser: user });
      
      // Emit events
      if (previousUser && !user) {
        emitEvent({ type: 'logout', previousUser });
      } else if (!previousUser && user) {
        emitEvent({ type: 'login', user });
      } else if (previousUser && user && previousUser.username !== user.username) {
        emitEvent({ type: 'user_switch', user, previousUser });
      }
    },
    
    addLoggedInUser: (user) => {
      const { loggedInUsers } = get();
      const updatedUsers = [...loggedInUsers.filter(u => u.username !== user.username), user];
      
      // Encrypt and store
      const encryptedUsers = encryptData(updatedUsers);
      localStorage.setItem('logged-in-users', encryptedUsers);
      
      set({ loggedInUsers: updatedUsers });
      emitEvent({ type: 'user_add', user });
    },
    
    removeLoggedInUser: (username) => {
      const { loggedInUsers, currentUser } = get();
      const userToRemove = loggedInUsers.find(u => u.username === username);
      const updatedUsers = loggedInUsers.filter(u => u.username !== username);
      
      // Encrypt and store
      const encryptedUsers = encryptData(updatedUsers);
      localStorage.setItem('logged-in-users', encryptedUsers);
      
      // If removing current user, clear current user
      if (currentUser?.username === username) {
        localStorage.removeItem('logged-in-user');
        set({ currentUser: null, loggedInUsers: updatedUsers });
        emitEvent({ type: 'logout', previousUser: currentUser });
      } else {
        set({ loggedInUsers: updatedUsers });
      }
      
      if (userToRemove) {
        emitEvent({ type: 'user_remove', user: userToRemove });
      }
    },
    
    clearAllUsers: () => {
      localStorage.removeItem('logged-in-users');
      localStorage.removeItem('logged-in-user');
      set({ currentUser: null, loggedInUsers: [] });
      emitEvent({ type: 'logout' });
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
          serverResponse
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

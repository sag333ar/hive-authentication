import { create } from 'zustand';
import type { LoggedInUser, AuthStore } from '../types/auth';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_LOCAL_KEY || 'default-key';

const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
};

// Clean up any old plain text storage
const cleanupOldStorage = () => {
  // Remove any old Zustand persist storage that might contain plain text
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('hive-auth-encrypted');
};

// Initialize state from encrypted localStorage
const initializeState = () => {
  // First clean up old storage
  cleanupOldStorage();
  
  try {
    const encryptedCurrentUser = localStorage.getItem('logged-in-user');
    const encryptedUsers = localStorage.getItem('logged-in-users');
    
    let currentUser = null;
    let loggedInUsers: LoggedInUser[] = [];
    
    if (encryptedCurrentUser) {
      currentUser = decryptData(encryptedCurrentUser);
    }
    
    if (encryptedUsers) {
      loggedInUsers = decryptData(encryptedUsers) || [];
    }
    
    return { currentUser, loggedInUsers };
  } catch (error) {
    console.error('Failed to initialize auth state:', error);
    // Clear corrupted data
    localStorage.removeItem('logged-in-user');
    localStorage.removeItem('logged-in-users');
    return { currentUser: null, loggedInUsers: [] };
  }
};

export const useAuthStore = create<AuthStore>((set, get) => {
  const initialState = initializeState();
  
  return {
    currentUser: initialState.currentUser,
    loggedInUsers: initialState.loggedInUsers,
    
    setCurrentUser: (user: LoggedInUser | null) => {
      set({ currentUser: user });
      
      // Only store encrypted data, never plain text
      if (user) {
        const encryptedUser = encryptData(user);
        localStorage.setItem('logged-in-user', encryptedUser);
      } else {
        localStorage.removeItem('logged-in-user');
      }
    },
    
    addLoggedInUser: (user: LoggedInUser) => {
      const { loggedInUsers } = get();
      const existingUserIndex = loggedInUsers.findIndex(u => u.username === user.username);
      
      let updatedUsers;
      if (existingUserIndex >= 0) {
        updatedUsers = [...loggedInUsers];
        updatedUsers[existingUserIndex] = user;
      } else {
        updatedUsers = [...loggedInUsers, user];
      }
      
      set({ loggedInUsers: updatedUsers });
      
      // Only store encrypted data
      const encryptedUsers = encryptData(updatedUsers);
      localStorage.setItem('logged-in-users', encryptedUsers);
    },
    
    removeLoggedInUser: (username: string) => {
      const { loggedInUsers, currentUser } = get();
      const updatedUsers = loggedInUsers.filter(u => u.username !== username);
      
      set({ loggedInUsers: updatedUsers });
      
      // If removing current user, clear current user
      if (currentUser?.username === username) {
        set({ currentUser: null });
        localStorage.removeItem('logged-in-user');
      }
      
      // Only store encrypted data
      const encryptedUsers = encryptData(updatedUsers);
      localStorage.setItem('logged-in-users', encryptedUsers);
    },
    
    clearAllUsers: () => {
      set({ currentUser: null, loggedInUsers: [] });
      localStorage.removeItem('logged-in-user');
      localStorage.removeItem('logged-in-users');
    },
  };
});

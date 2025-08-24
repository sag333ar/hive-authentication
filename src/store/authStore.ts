import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      loggedInUsers: [],
      
      setCurrentUser: (user: LoggedInUser | null) => {
        set({ currentUser: user });
        
        // Update localStorage
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
        
        // Update localStorage
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
        
        // Update localStorage
        const encryptedUsers = encryptData(updatedUsers);
        localStorage.setItem('logged-in-users', encryptedUsers);
      },
      
      clearAllUsers: () => {
        set({ currentUser: null, loggedInUsers: [] });
        localStorage.removeItem('logged-in-user');
        localStorage.removeItem('logged-in-users');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        loggedInUsers: state.loggedInUsers,
      }),
      onRehydrateStorage: () => (state) => {
        // Decrypt data from localStorage on rehydration
        if (state) {
          try {
            const encryptedCurrentUser = localStorage.getItem('logged-in-user');
            const encryptedUsers = localStorage.getItem('logged-in-users');
            
            if (encryptedCurrentUser) {
              const decryptedUser = decryptData(encryptedCurrentUser);
              if (decryptedUser) {
                state.currentUser = decryptedUser;
              }
            }
            
            if (encryptedUsers) {
              const decryptedUsers = decryptData(encryptedUsers);
              if (decryptedUsers) {
                state.loggedInUsers = decryptedUsers;
              }
            }
          } catch (error) {
            console.error('Failed to rehydrate auth state:', error);
          }
        }
      },
    }
  )
);

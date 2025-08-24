export interface HiveAuthResult {
  provider: string;
  challenge: string;  // This will be a hash from the Hive authentication
  publicKey: string;
  username: string;
  proof: string;      // This will be the timestamp
}

export interface ServerAuthResponse {
  token: string;
  type: 'admin' | 'guide' | 'owner' | 'user';
}

export interface LoggedInUser {
  username: string;
  provider: string;
  challenge: string;
  publicKey: string;
  proof: string;
  token: string;
  type: string;
}

export interface AuthStore {
  currentUser: LoggedInUser | null;
  loggedInUsers: LoggedInUser[];
  setCurrentUser: (user: LoggedInUser | null) => void;
  addLoggedInUser: (user: LoggedInUser) => void;
  removeLoggedInUser: (username: string) => void;
  clearAllUsers: () => void;
}

export interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: LoggedInUser) => void;
}

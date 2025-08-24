export interface HiveAuthResult {
  provider: string;
  result: any;
  publicKey: string;
  username: string;
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

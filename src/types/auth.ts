export interface HiveAuthResult {
  provider: string;
  challenge: string;  // This will be a hash from the Hive authentication
  publicKey: string;
  username: string;
  proof: string;      // This will be the timestamp
}

export interface ServerAuthResponse {
  token: string;
  type: string;
}

export interface LoggedInUser {
  username: string;
  provider: string;
  challenge: string;
  publicKey: string;
  proof: string;
  serverResponse: string; // JSON string from dev's app
}

export interface AuthStore {
  currentUser: LoggedInUser | null;
  loggedInUsers: LoggedInUser[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentUser: (user: LoggedInUser | null) => void;
  addLoggedInUser: (user: LoggedInUser) => void;
  removeLoggedInUser: (username: string) => Promise<void>;
  clearAllUsers: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // New callback-based authentication
  authenticateWithCallback: (
    hiveResult: HiveAuthResult,
    callback: (hiveResult: HiveAuthResult) => Promise<string>
  ) => Promise<void>;
}

// Event types for the callback system
export type AuthEventType = 'login' | 'logout' | 'user_switch' | 'user_add' | 'user_remove';

export interface AuthEvent {
  type: AuthEventType;
  user?: LoggedInUser;
  previousUser?: LoggedInUser;
}

export type AuthEventListener = (event: AuthEvent) => void;

export interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

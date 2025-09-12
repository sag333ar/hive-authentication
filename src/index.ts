// Components
export { AuthButton } from './components/AuthButton';
export { LoginDialog } from './components/LoginDialog';
export { SwitchUserModal } from './components/SwitchUserModal';
export { Wallet } from './components/Wallet';
export { VideoFeed } from './components/video/VideoFeed';

// Store and hooks
export { useAuthStore } from './store/authStore';
export { useProgrammaticAuth } from './hooks/useProgrammaticAuth';

// Services
export { AuthService } from './services/authService';
export { ProgrammaticAuth } from './services/programmaticAuth';

// Types
export type {
  HiveAuthResult,
  ServerAuthResponse,
  LoggedInUser,
  AuthStore,
  SwitchUserModalProps,
  LoginDialogProps
} from './types/auth';

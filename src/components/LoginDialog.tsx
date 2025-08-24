import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ 
  isOpen, 
  onClose, 
  showBackButton = false, 
  onBack 
}) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const { setCurrentUser, addLoggedInUser } = useAuthStore();
  
  useEffect(() => {
    if (username) {
      setAvatarUrl(`https://images.hive.blog/u/${username}/avatar`);
    } else {
      setAvatarUrl('');
    }
  }, [username]);
  
  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const user = await AuthService.completeLogin(username.trim());
      
      // Store user in state and localStorage
      addLoggedInUser(user);
      setCurrentUser(user);
      
      // Close dialog
      onClose();
      setUsername('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal modal-open">
      <div className="modal-box relative">
        <div className="flex items-center justify-between mb-4">
          {showBackButton && (
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onBack}
            >
              ←
            </button>
          )}
          
          <h3 className="font-bold text-lg flex-1 text-center">
            {showBackButton ? 'Add Account' : 'Login with Hive'}
          </h3>
          
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Hive Username</span>
          </label>
          
          <div className="flex items-center gap-3">
            {avatarUrl && (
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  <img 
                    src={avatarUrl} 
                    alt={`${username} avatar`}
                    onError={(e) => {
                      // Fallback to default avatar if image fails to load
                      (e.target as HTMLImageElement).src = 'https://images.hive.blog/u/0/avatar';
                    }}
                  />
                </div>
              </div>
            )}
            
            <input
              type="text"
              placeholder="Enter username"
              className="input input-bordered flex-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3">
            Choose your login method:
          </p>
          
          <div className="space-y-2">
            <button
              className="btn btn-primary w-full"
              onClick={handleLogin}
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Logging in...
                </>
              ) : (
                'Login with HiveKeychain'
              )}
            </button>
            
            <button className="btn btn-outline w-full" disabled>
              HiveAuth (Coming Soon)
            </button>
            
            <button className="btn btn-outline w-full" disabled>
              Private Posting Key (Coming Soon)
            </button>
          </div>
        </div>
        
        {error && (
          <div className="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
      
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

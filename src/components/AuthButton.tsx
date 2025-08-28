import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoginDialog } from './LoginDialog';
import { SwitchUserModal } from './SwitchUserModal';
import type { AuthButtonProps } from '../types/auth';

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  onAuthenticate, 
  hiveauth, 
  hivesigner
}) => {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);
  const { currentUser } = useAuthStore();
  
  // Create the config object
  const config = { hiveauth, hivesigner };
  
  const handleButtonClick = () => {
    if (currentUser) {
      // Show switch user modal
      setIsSwitchUserModalOpen(true);
    } else {
      // Open login dialog
      setIsLoginDialogOpen(true);
    }
  };
  
  const getAvatarUrl = (username: string) => {
    return `https://images.hive.blog/u/${username}/avatar`;
  };
  
  return (
    <>
      <button
        onClick={handleButtonClick}
        className="btn btn-primary"
        title={currentUser ? `Logged in as ${currentUser.username}` : 'Click to login'}
      >
        {currentUser ? (
          <div className="flex items-center gap-2">
            <div className="avatar">
              <div className="w-6 h-6 rounded-full">
                <img 
                  src={getAvatarUrl(currentUser.username)} 
                  alt={`${currentUser.username} avatar`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.hive.blog/u/0/avatar';
                  }}
                />
              </div>
            </div>
            <span className="hidden sm:inline">{currentUser.username}</span>
          </div>
        ) : (
          'Login'
        )}
      </button>
      
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onAuthenticate={onAuthenticate}
        config={config}
      />
      
      <SwitchUserModal
        isOpen={isSwitchUserModalOpen}
        onClose={() => setIsSwitchUserModalOpen(false)}
        onAuthenticate={onAuthenticate}
        config={config}
      />
    </>
  );
};

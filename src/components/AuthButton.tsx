import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoginDialog } from './LoginDialog';
import { SwitchUserModal } from './SwitchUserModal';
import type { AuthButtonProps } from '../types/auth';

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  onAuthenticate,
  aioha,
  shouldShowSwitchUser = true,
}) => {
  // const { aioha } = useAioha();
  const { setHiveAuthPayload } = useAuthStore();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);
  const { currentUser } = useAuthStore();

  useEffect(() => {
    aioha.on('hiveauth_login_request', (payload: string) => {
      setHiveAuthPayload(payload);
    });
  }, [aioha]);
  
  
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
        {currentUser ? (
          <div className="flex flex-col items-center" onClick={handleButtonClick}>
            <div className="avatar">
              <div className="w-7 h-7 rounded-full">
                <img 
                  src={getAvatarUrl(currentUser.username)} 
                  alt={`${currentUser.username} avatar`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.hive.blog/u/0/avatar';
                  }}
                />
              </div>
            </div>
            <div className="text-black/80 dark:text-gray-300 text-sm">{currentUser.username}</div>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleButtonClick}>
            Login
          </button>
        )}
      
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onAuthenticate={onAuthenticate}
        aioha={aioha}
      />
      
      <SwitchUserModal
        isOpen={isSwitchUserModalOpen}
        shouldShowSwitchUser={shouldShowSwitchUser ?? true}
        onClose={() => setIsSwitchUserModalOpen(false)}
        onAuthenticate={onAuthenticate}
        aioha={aioha}
      />
      </>
  );
};

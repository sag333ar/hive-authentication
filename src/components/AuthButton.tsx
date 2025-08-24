import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoginDialog } from './LoginDialog';

export const AuthButton: React.FC = () => {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { currentUser, setCurrentUser } = useAuthStore();
  
  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const handleButtonClick = () => {
    if (currentUser) {
      // Show user menu or logout
      handleLogout();
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
      />
    </>
  );
};

import React, { useState } from 'react';
import { LoginDialog } from './LoginDialog';
import { useAuthStore } from '../store/authStore';
import type { LoggedInUser, SwitchUserModalProps } from '../types/auth';
import { AuthService } from '../services/authService';
import KeychainIcon from '../assets/keychain.svg'
import HiveAuthIcon from '../assets/hiveauth-light.svg'
import PrivateKeyIcon from '../assets/privatekey.svg'

export const SwitchUserModal: React.FC<SwitchUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onAuthenticate,
  aioha,
}) => { 
  const [showAddAccount, setShowAddAccount] = useState(false);
  const { currentUser, loggedInUsers, setCurrentUser, removeLoggedInUser, clearAllUsers } = useAuthStore();
  
  const handleSwitchUser = async (user: LoggedInUser) => {
    setCurrentUser(user);
    if (user.privatePostingKey) {
      await AuthService.switchUserWithPrivatePostingKey(aioha, user.username, user.privatePostingKey);
    }
    AuthService.switchUser(aioha, user.username);
    onClose();
  };
  
  const handleLogoutUser = (username: string) => {
    removeLoggedInUser(username);
    AuthService.removeUser(aioha, username);
  };
  
  const handleLogoutAll = () => {
    clearAllUsers();
    onClose();
  };
  
  const handleAddAccount = () => {
    setShowAddAccount(true);
  };
  
  const handleBackFromLogin = () => {
    setShowAddAccount(false);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'keychain':
        return KeychainIcon;
      case 'hiveauth':
        return HiveAuthIcon;
      case 'privatePostingKey':
        return PrivateKeyIcon;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'keychain':
        return 'Keychain';
      case 'hiveauth':
        return 'HiveAuth';
      case 'privatePostingKey':
        return 'PrivateKey';
    }
  };
  
  if (!isOpen) return null;
  
  if (showAddAccount) {
    return (
      <LoginDialog 
        isOpen={true} 
        onClose={handleBackFromLogin}
        showBackButton={true}
        onBack={handleBackFromLogin}
        onAuthenticate={onAuthenticate}
        aioha={aioha}
      />
    );
  }
  
    return (
    <div className="modal modal-open">
      <div className="modal-box absolute">
        <button
          className="btn btn-sm btn-circle btn-ghost bg-base-200 hover:bg-base-300 border border-base-300 absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        
        <h3 className="font-bold text-lg mb-4">Switch User</h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loggedInUsers.map((user) => (
            <div 
              key={user.username} 
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                currentUser?.username === user.username 
                  ? 'border-primary bg-primary/10' 
                  : 'border-base-300 hover:border-primary/50'
              }`}
              onClick={() => handleSwitchUser(user)}
            >
              {/* Avatar */}
              <div className="avatar">
                <div className="w-10 h-10 rounded-full">
                  <img 
                    src={`https://images.hive.blog/u/${user.username}/avatar`}
                    alt={`${user.username} avatar`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.hive.blog/u/0/avatar';
                    }}
                  />
                </div>
              </div>
              <div className='avatar'>
                <div className='w-10 h-10 rounded-full'>
                  <img src={getProviderIcon(user.provider)} alt={`${getProviderName(user.provider)}`} />
                </div>
              </div>
              
              {/* Username */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.username}</p>
                <p className="text-sm text-gray-500 capitalize">{getProviderName(user.provider)}</p>
              </div>
              
              {/* Status/Action */}
              <div className="flex items-center gap-2">
                {currentUser?.username === user.username ? (
                  <span className="badge badge-primary badge-sm">Current</span>
                ) : (
                  <button
                    className="btn btn-xs btn-outline btn-error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogoutUser(user.username);
                    }}
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom Actions */}
        <div className="modal-action flex-col gap-2">
          <button
            className="btn btn-primary w-full"
            onClick={handleAddAccount}
          >
            Add Account
          </button>
          
          <button
            className="btn btn-outline btn-error w-full"
            onClick={handleLogoutAll}
          >
            Logout All
          </button>
        </div>
      </div>
      
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthService } from '../services/authService';
import type { LoginDialogProps, HiveAuthEvent } from '../types/auth';
import QRCode from 'qrcode';

export const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  onClose,
  showBackButton = false,
  onBack,
  onAuthenticate,
  config
}) => {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hiveAuthPayload, setHiveAuthPayload] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoading, authenticateWithCallback } = useAuthStore();

  useEffect(() => {
    if (username.trim()) {
      setAvatarUrl(`https://images.hive.blog/u/${username}/avatar`);
    } else {
      setAvatarUrl(null);
    }
  }, [username]);

  // Handle HiveAuth request and generate QR code
  const handleHiveAuthRequest = async (payload: string) => {
    try {
      // Generate QR code from payload
      const qrDataUrl = await QRCode.toDataURL(payload, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrDataUrl);
      setHiveAuthPayload(payload);
      setShowQRCode(true);
      
      // Start 30-second timer
      startTimer();
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setError('Failed to generate QR code for HiveAuth');
    }
  };

  // Start 30-second countdown timer
  const startTimer = () => {
    setTimeRemaining(30);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer expired, hide QR code and show login form
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setShowQRCode(false);
          setHiveAuthPayload(null);
          setQrCodeDataUrl('');
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleLogin = async (keychain: boolean = true) => {
    if (!username.trim()) return;

    setError(null);
    setHiveAuthPayload(null);
    setShowQRCode(false);
    setQrCodeDataUrl('');
    
    // Clear timer if running
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      // Check if HiveAuth is selected but not configured
      if (!keychain && !config?.hiveauth) {
        throw new Error('HiveAuth not configured. Please provide hiveauth configuration.');
      }

      // Initialize Aioha with configuration
      if (config) {
        await AuthService.initialize(config);
      } else {
        throw new Error('Configuration is required for authentication');
      }

      // Get the Hive authentication result
      const hiveResult = keychain ? await AuthService.loginWithHiveKeychain(username.trim()) : await AuthService.loginWithHiveAuth(username.trim());

      // Check if callback is provided
      if (!onAuthenticate) {
        throw new Error('No authentication callback provided. Please supply onAuthenticate prop to AuthButton.');
      }

      // Use the callback-based authentication
      await authenticateWithCallback(
        hiveResult,
        onAuthenticate,
        config,
        config?.hiveauth ? (event: HiveAuthEvent) => {
          handleHiveAuthRequest(event.payload);
        } : undefined
      );

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && username.trim() && !isLoading) {
      handleLogin(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box relative max-w-md mx-auto">
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
            className="btn btn-sm btn-circle btn-ghost bg-base-200 hover:bg-base-300 border border-base-300"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* HiveAuth QR Code Display - Show this when QR code is active */}
        {showQRCode && hiveAuthPayload && (
          <div className="text-center">
            <h4 className="font-semibold text-lg mb-4">HiveAuth Login Request</h4>
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your HiveAuth wallet app to approve the login for <strong>{username}</strong>
            </p>
            
            {/* Timer */}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">QR Code expires in:</div>
              <div className="text-2xl font-bold text-primary">{timeRemaining}s</div>
            </div>
            
            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg border shadow-lg">
                <img src={qrCodeDataUrl} alt="HiveAuth QR Code" className="w-48 h-48" />
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              Waiting for wallet approval...
            </p>
            
            {/* Cancel button */}
            <button
              className="btn btn-outline btn-sm mt-4"
              onClick={() => {
                setShowQRCode(false);
                setHiveAuthPayload(null);
                setQrCodeDataUrl('');
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Login Form - Hide this when QR code is active */}
        {!showQRCode && (
          <>
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
                  onClick={() => handleLogin(true)}
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

                <button
                  className="btn btn-outline w-full"
                  onClick={() => handleLogin(false)}
                  disabled={isLoading || !username.trim() || !config?.hiveauth}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login with HiveAuth'
                  )}
                </button>

                <button className="btn btn-outline w-full" disabled>
                  Private Posting Key (Coming Soon)
                </button>
              </div>
            </div>
          </>
        )}

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

"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Popup, { PopupState } from '@/components/Popup';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  repeatPassword: string;
  twoFactorAuthentication: boolean;
}

const ChangePasswordPage = () => {
  const { isDarkMode, isSystemMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
    twoFactorAuthentication: false
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    repeat: false
  });
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const router = useRouter();

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const handleInputChange = (field: keyof PasswordForm, value: string | boolean) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'repeat') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password: string): boolean => {
    // Password should be at least 8 characters with uppercase, lowercase, number
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return minLength && hasUppercase && hasLowercase && hasNumber;
  };

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  const handleSave = async () => {
    // Validation
    if (!passwordForm.currentPassword) {
      showPopup('error', 'Validation Error', 'Please enter your current password');
      return;
    }

    if (!passwordForm.newPassword) {
      showPopup('error', 'Validation Error', 'Please enter a new password');
      return;
    }

    if (!passwordForm.repeatPassword) {
      showPopup('error', 'Validation Error', 'Please repeat your new password');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.repeatPassword) {
      showPopup('error', 'Validation Error', 'New password and repeat password do not match');
      return;
    }

    if (!validatePassword(passwordForm.newPassword)) {
      showPopup('error', 'Validation Error', 'New password must be at least 8 characters long and contain uppercase, lowercase, and number');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      showPopup('error', 'Validation Error', 'New password must be different from current password');
      return;
    }

    const token = getToken();
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please log in to change your password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/password/change`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          twoFactorAuthentication: passwordForm.twoFactorAuthentication
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      
      showPopup('success', 'Success', 'Password changed successfully! Please log in with your new password.');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('passwordChanged'));
      
      // Get current user ID and navigate to profile page
      try {
        const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (currentUserResponse.ok) {
          const currentUser = await currentUserResponse.json();
          setTimeout(() => {
            router.push(`/dashboard/profile/${currentUser.id}`);
          }, 2000);
        } else {
          // Fallback to "me" if we can't get the user ID
          setTimeout(() => {
            router.push('/dashboard/profile/me');
          }, 2000);
        }
      } catch (error) {
        console.error('Error getting current user ID:', error);
        // Fallback to "me" if there's an error
        setTimeout(() => {
          router.push('/dashboard/profile/me');
        }, 2000);
      }
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        repeatPassword: '',
        twoFactorAuthentication: false
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.message || 'Failed to change password. Please try again.';
      showPopup('error', 'Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className={`rounded-lg shadow-sm border p-8 transition-all duration-200 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 shadow-xl' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-2xl font-semibold ${
            isDarkMode 
              ? 'text-white' 
              : 'text-gray-900'
          }`}>Change Password</h1>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <span className="text-sm">🌙</span>
            <span>{isSystemMode ? 'System Mode' : 'Manual Mode'}</span>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <label className={`block text-sm mb-2 ${
              isDarkMode 
                ? 'text-gray-300' 
                : 'text-gray-600'
            }`}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 text-white bg-gray-700 placeholder-gray-400' 
                    : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500'
                }`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPasswords.current ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.64 5.64m4.238 4.238L15.12 15.12M15.12 15.12l4.12 4.12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className={`block text-sm mb-2 ${
              isDarkMode 
                ? 'text-gray-300' 
                : 'text-gray-600'
            }`}>
              New password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 text-white bg-gray-700 placeholder-gray-400' 
                    : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500'
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPasswords.new ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.64 5.64m4.238 4.238L15.12 15.12M15.12 15.12l4.12 4.12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordForm.newPassword && !validatePassword(passwordForm.newPassword) && (
              <p className={`mt-1 text-xs ${
                isDarkMode 
                  ? 'text-red-400' 
                  : 'text-red-600'
              }`}>
                Password must be at least 8 characters with uppercase, lowercase, and number
              </p>
            )}
          </div>

          {/* Repeat Password */}
          <div>
            <label className={`block text-sm mb-2 ${
              isDarkMode 
                ? 'text-gray-300' 
                : 'text-gray-600'
            }`}>
              Repeat password
            </label>
            <div className="relative">
              <input
                type={showPasswords.repeat ? 'text' : 'password'}
                value={passwordForm.repeatPassword}
                onChange={(e) => handleInputChange('repeatPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 text-white bg-gray-700 placeholder-gray-400' 
                    : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500'
                }`}
                placeholder="Repeat new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('repeat')}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPasswords.repeat ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.64 5.64m4.238 4.238L15.12 15.12M15.12 15.12l4.12 4.12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordForm.repeatPassword && passwordForm.newPassword !== passwordForm.repeatPassword && (
              <p className={`mt-1 text-xs ${
                isDarkMode 
                  ? 'text-red-400' 
                  : 'text-red-600'
              }`}>
                Passwords do not match
              </p>
            )}
          </div>

          {/* Two Factor Authentication */}
          <div className={`border-t pt-6 ${
            isDarkMode 
              ? 'border-gray-600' 
              : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <label className={`block text-sm mb-1 ${
                  isDarkMode 
                    ? 'text-gray-300' 
                    : 'text-gray-600'
                }`}>
                  Two factor authentication
                </label>
                <p className={`text-sm ${
                  isDarkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
                }`}>
                  {passwordForm.twoFactorAuthentication ? 'Enable' : 'Disable'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('twoFactorAuthentication', !passwordForm.twoFactorAuthentication)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  passwordForm.twoFactorAuthentication 
                    ? 'bg-blue-600' 
                    : isDarkMode 
                      ? 'bg-gray-600' 
                      : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    passwordForm.twoFactorAuthentication ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Security Tips */}
        <div className={`mt-8 p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-yellow-900/20 border-yellow-700' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h4 className={`text-sm font-medium mb-2 ${
            isDarkMode 
              ? 'text-yellow-200' 
              : 'text-yellow-900'
          }`}>Password Security Tips:</h4>
          <ul className={`text-sm space-y-1 ${
            isDarkMode 
              ? 'text-yellow-300' 
              : 'text-yellow-800'
          }`}>
            <li>• Use at least 8 characters with a mix of letters, numbers, and symbols</li>
            <li>• Avoid using personal information or common words</li>
            <li>• Don't reuse passwords from other accounts</li>
            <li>• Enable two-factor authentication for extra security</li>
          </ul>
        </div>
      </div>

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default ChangePasswordPage;
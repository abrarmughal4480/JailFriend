'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '../utils/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { setToken } from '../utils/auth';
import AuthGuard from '../components/AuthGuard';

interface FormData {
  email: string;
  password: string;
  rememberDevice: boolean;
  username?: string;
  confirmPassword?: string;
}

interface Avatar {
  img: string;
  name: string;
  profileLink: string;
  isCustom?: boolean;
}

interface AvatarUploadModal {
  isOpen: boolean;
  name: string;
  profileLink: string;
  imageFile: File | null;
  imagePreview: string;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  message?: { text: string; type: 'success' | 'error' | 'info' };
  children: React.ReactNode;
}> = ({ isOpen, onClose, message, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {message && (
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              {message.type === 'success' ? (
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              ) : message.type === 'error' ? (
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {message.type === 'success' ? 'Success!' : 
                 message.type === 'error' ? 'Error!' : 'Information'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-base">{message.text}</p>
              
              <button
                onClick={onClose}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 text-base ${
                  message.type === 'success'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {message.type === 'success' ? 'Continue' : 'Try Again'}
              </button>
            </div>
          </div>
        )}

        {!message && (
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ×
            </button>

            <div className="p-6 pt-12">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home(): React.ReactElement {
  const router = useRouter();
  const [loginType, setLoginType] = useState<'username' | 'social'>('username');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberDevice: false,
    username: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [avatarModal, setAvatarModal] = useState<AvatarUploadModal>({
    isOpen: false,
    name: '',
    profileLink: '',
    imageFile: null,
    imagePreview: ''
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [modalMessage, setModalMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | undefined>(undefined);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const [avatars, setAvatars] = useState<Avatar[]>([
    { img: '👩🏻‍💼', name: 'Sarah Johnson', profileLink: '/profile/sarah-johnson' },
    { img: '👨🏻‍🦳', name: 'Michael Chen', profileLink: '/profile/michael-chen' },
    { img: '👩🏻', name: 'Emma Wilson', profileLink: '/profile/emma-wilson' },
    { img: '👩🏻‍🦰', name: 'Lisa Rodriguez', profileLink: '/profile/lisa-rodriguez' },
    { img: '👨🏻‍💼', name: 'David Kim', profileLink: '/profile/david-kim' },
    { img: '👩🏻‍🦱', name: 'Maya Patel', profileLink: '/profile/maya-patel' },
    { img: '🏢', name: 'TechCorp Inc', profileLink: '/profile/techcorp-inc' },
    { img: '👨🏻', name: 'Alex Thompson', profileLink: '/profile/alex-thompson' }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);


  const showPopup = (type: 'success' | 'error', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
    if (popup.type === 'success') {
      setAuthModalOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault(); // Prevent default form submission
    // Validate form fields before API call
    if (!formData.email.trim()) {
      showPopup('error', 'Validation Error', 'Please enter your email.');
      return;
    }
    
    if (!formData.password.trim()) {
      showPopup('error', 'Validation Error', 'Please enter your password.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Use actual API call instead of simulation
      const response = await loginApi({
        email: formData.email.trim(),
        password: formData.password.trim()
      });
      
      if (response?.token) {
        // Store token using auth utility
        setToken(response.token);
        localStorage.setItem('userEmail', formData.email.trim());
        
        // Store user data in localStorage for avatar and other user info
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('🔍 Login - Stored user data in localStorage:', response.user);
        }
        
        showPopup('success', 'Login Successful!', 'Welcome back! You will be redirected to your dashboard.');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        showPopup('error', 'Login Failed', 'Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
      showPopup('error', 'Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarModalChange = (field: keyof AvatarUploadModal, value: any): void => {
    setAvatarModal(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarModal(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAvatar = (): void => {
    if (avatarModal.name && avatarModal.profileLink && avatarModal.imagePreview) {
      const newAvatar: Avatar = {
        img: avatarModal.imagePreview,
        name: avatarModal.name,
        profileLink: avatarModal.profileLink,
        isCustom: true
      };
      
      setAvatars(prev => [...prev, newAvatar]);
      setAvatarModal({
        isOpen: false,
        name: '',
        profileLink: '',
        imageFile: null,
        imagePreview: ''
      });
    }
  };

  const closeModal = (): void => {
    setAvatarModal({
      isOpen: false,
      name: '',
      profileLink: '',
      imageFile: null,
      imagePreview: ''
    });
  };


  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="w-full min-h-screen bg-custom-primary transition-all duration-500 overflow-x-hidden overflow-y-auto">
        {/* Standalone Popup Modal */}
        {popup.isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4 bg-black/20 backdrop-blur-md">
            <div className="bg-custom-tertiary rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-2 sm:mx-4 transform transition-all duration-300 scale-100 max-h-[95vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center mb-3 sm:mb-4">
                  {popup.type === 'success' ? (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100/50 dark:bg-green-500/20 backdrop-blur-sm border border-green-300/30 dark:border-green-400/30 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100/50 dark:bg-red-500/20 backdrop-blur-sm border border-red-300/30 dark:border-red-400/30 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white break-words">
                    {popup.title}
                  </h3>
                  <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words leading-relaxed">
                    {popup.message}
                  </p>
                  
                  <button
                    onClick={closePopup}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base touch-manipulation ${
                      popup.type === 'success'
                        ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {popup.type === 'success' ? 'Continue' : 'Try Again'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b w-full transition-colors duration-200 bg-custom-tertiary/90 border-custom-primary shadow-lg">
          <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 w-full max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-base">J</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold transition-colors duration-200 text-gray-800 dark:text-white">jaifriend</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => { setAuthType('login'); setAuthModalOpen(true); setModalMessage(undefined); }}
                className="px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                Register
              </button>
            </div>
          </div>
        </header>

        {/* Avatar Upload Modal */}
        {avatarModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-custom-tertiary rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-custom-primary">Add Your Avatar</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    {avatarModal.imagePreview ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
                        <img 
                          src={avatarModal.imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={avatarModal.name}
                    onChange={(e) => handleAvatarModalChange('name', e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-custom-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-custom-primary/20 text-custom-primary placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Link
                  </label>
                  <input
                    type="text"
                    value={avatarModal.profileLink}
                    onChange={(e) => handleAvatarModalChange('profileLink', e.target.value)}
                    placeholder="/profile/your-username"
                    className="w-full px-4 py-3 border border-custom-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-custom-primary/20 text-custom-primary placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAvatar}
                    disabled={!avatarModal.name || !avatarModal.profileLink || !avatarModal.imagePreview}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Add Avatar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="w-full px-4 pt-20 pb-8 lg:pt-24 lg:pb-12 box-border">
          {/* Hero Section */}
          <div className="text-center mb-16 lg:mb-20 mt-8 sm:mt-12 lg:mt-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-full border border-blue-100 dark:border-gray-600 mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              <p className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide text-sm">WELCOME TO JAIFRIEND</p>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 lg:mb-12 leading-tight px-2">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Connect with your family and friends
              </span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="text-gray-700 dark:text-gray-300">and share your moments.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join millions of people sharing their stories, connecting with loved ones, and discovering new friendships in a safe, private environment.
            </p>
          </div>

          {/* Login Form */}
          <div className="w-full max-w-lg mx-auto bg-[rgba(32,32,33,0.8)] backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 mb-12 sm:mb-16 lg:mb-20 border border-white/20 transition-all duration-300 hover:shadow-3xl">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-custom-primary mb-3">Welcome Back</h2>
              <p className="text-sm sm:text-base text-custom-secondary">Sign in to your account to continue</p>
            </div>
            
            <div className="flex mb-8 sm:mb-10 w-full bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 text-center font-semibold transition-all duration-300 relative rounded-lg ${
                  loginType === 'username'
                    ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                onClick={() => setLoginType('username')}
              >
                Email Login
              </button>
              <button
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 text-center font-semibold transition-all duration-300 relative rounded-lg ${
                  loginType === 'social'
                    ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                onClick={() => setLoginType('social')}
              >
                Social Login
              </button>
            </div>

            {loginType === 'username' ? (
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <div className="space-y-4 sm:space-y-5">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-custom-primary/20 border border-custom-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-custom-primary/30 transition-all duration-300 text-custom-primary placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base backdrop-blur-sm"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-custom-primary/20 border border-custom-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-custom-primary/30 transition-all duration-300 text-custom-primary placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 space-y-3 sm:space-y-0 mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberDevice"
                      id="rememberDevice"
                      checked={formData.rememberDevice}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Remember this device
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors text-left sm:text-right"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl text-sm sm:text-base mb-6"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      <span className="text-sm sm:text-base">Signing In...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
                      onClick={() => router.push('/register')}
                    >
                      Sign up here
                    </button>
                  </span>
                </div>
              </form>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-sm sm:text-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
                <button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-sm sm:text-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <button className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-sm sm:text-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.02-1.53-.88-3.11-.88-1.59 0-1.83.86-3.11.88-1.28.02-2.22-1.18-3.05-2.47C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>
            )}
          </div>

        </main>

        {/* Avatar Section - Moved to bottom */}
        <div className="w-full px-4 py-8 lg:py-12">
          <div className="text-center">
            {/* Avatar Images */}
            <div className="w-auto mb-8 overflow-hidden">
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4">
                {avatars.map((avatar: Avatar, i: number) => (
                  <button key={i} className="group relative">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-xl border-4 border-white dark:border-gray-700 overflow-hidden ring-2 ring-transparent hover:ring-blue-300 dark:hover:ring-blue-500">
                      {avatar.isCustom ? (
                        <img 
                          src={avatar.img} 
                          alt={avatar.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl md:text-4xl">{avatar.img}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-50">
                      {avatar.name}
                    </div>
                  </button>
                ))}
                
                {/* Add Avatar Button */}
                <button
                  onClick={() => setAvatarModal({ ...avatarModal, isOpen: true })}
                  className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-xl border-4 border-white dark:border-gray-700 group relative ring-2 ring-transparent hover:ring-blue-300 dark:hover:ring-blue-500"
                >
                  <span className="text-white text-2xl sm:text-3xl font-bold">+</span>
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-50">
                    Add Your Avatar
                  </div>
                </button>
              </div>
            </div>

            {/* Avatar Names */}
            <div className="w-auto flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-8 px-2 sm:px-4">
              {avatars.slice(0, 4).map((avatar: Avatar, i: number) => (
                <button key={i} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex-shrink-0 font-medium">
                  {avatar.name}
                </button>
              ))}
              {avatars.length > 4 && (
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  +{avatars.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 lg:py-16 border-t border-gray-200 dark:border-gray-700 w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5"></div>
          <div className="relative px-4 w-full box-border">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <span className="text-2xl font-bold text-gray-800 dark:text-white">Jaifriend</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Connecting people, sharing moments, building communities. Join millions of users worldwide.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 text-sm lg:text-base mb-8">
              <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Terms of Use</button>
              <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Privacy Policy</button>
              <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Contact Us</button>
              <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">About</button>
              <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Directory</button>
              <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Forum</button>
              <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium flex items-center">
                <span className="mr-2">🌐</span> Language
              </button>
            </div>
            
            <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-500 text-sm">© 2025 Jaifriend. All rights reserved.</span>
            </div>
          </div>
        </footer>

        {/* Auth Modal (Only for Login now) */}
        <Modal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} message={modalMessage}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Login</h2>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
              required
            />
            <button
              onClick={() => {
                // Validate form fields before API call
                if (!formData.email.trim()) {
                  setModalMessage({ text: 'Please enter your email.', type: 'error' });
                  return;
                }
                
                if (!formData.password.trim()) {
                  setModalMessage({ text: 'Please enter your password.', type: 'error' });
                  return;
                }

                setIsLoading(true);
                setModalMessage(undefined);
                
                // Use actual API call for modal login
                loginApi({
                  email: formData.email.trim(),
                  password: formData.password.trim()
                })
                .then(response => {
                  if (response?.token) {
                    setToken(response.token);
                    localStorage.setItem('userEmail', formData.email.trim());
                    
                    setModalMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                    setTimeout(() => {
                      router.push('/dashboard');
                    }, 1200);
                  } else {
                    setModalMessage({ text: 'Invalid credentials. Please try again.', type: 'error' });
                  }
                })
                .catch(error => {
                  console.error('Login error:', error);
                  const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
                  setModalMessage({ text: errorMessage, type: 'error' });
                })
                .finally(() => {
                  setIsLoading(false);
                });
              }}
              disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Don't have an account?{' '}
                <button 
                  type="button" 
                  className="text-blue-500 dark:text-blue-400 hover:underline font-medium" 
                  onClick={() => {
                    setAuthModalOpen(false);
                    router.push('/register');
                  }}
                >
                  Register
                </button>
              </span>
            </div>
          </div>
        </Modal>
      </div>
    </AuthGuard>
  );
}

'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '../utils/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import { setToken } from '../utils/auth';
import AuthGuard from '../components/AuthGuard';
import { useDarkMode } from '@/contexts/DarkModeContext';

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
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              ) : message.type === 'error' ? (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
  const { isDarkMode } = useDarkMode();
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
          if (response.isSetupDone) {
            router.push('/dashboard');
          } else {
            router.push('/start-up');
          }
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

  const trendingTags: string[] = ['#game', '#double', '#online', '#bifold', '#glass'];

  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className={`w-full min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'} overflow-x-hidden`}>
        {/* Standalone Popup Modal */}
        {popup.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  {popup.type === 'success' ? (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{popup.title}</h3>
                  <p className="text-gray-600 mb-6 text-base">{popup.message}</p>
                  
                  <button
                    onClick={closePopup}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 text-base ${
                      popup.type === 'success'
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {popup.type === 'success' ? 'Continue' : 'Try Again'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className={`sticky top-0 z-40 backdrop-blur-md border-b w-full transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'
        }`}>
          <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 w-full">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-base">J</span>
              </div>
              <span className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>jaifriend</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => { setAuthType('login'); setAuthModalOpen(true); setModalMessage(undefined); }}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-blue-400' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
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
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add Your Avatar</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    {avatarModal.imagePreview ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                        <img 
                          src={avatarModal.imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-500 text-xs">No image</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={avatarModal.name}
                    onChange={(e) => handleAvatarModalChange('name', e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Link
                  </label>
                  <input
                    type="text"
                    value={avatarModal.profileLink}
                    onChange={(e) => handleAvatarModalChange('profileLink', e.target.value)}
                    placeholder="/profile/your-username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAvatar}
                    disabled={!avatarModal.name || !avatarModal.profileLink || !avatarModal.imagePreview}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Add Avatar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="w-full px-4 py-8 lg:py-12 box-border">
          {/* Hero Section */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100 mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              <p className="text-blue-600 font-semibold tracking-wide text-sm">WELCOME TO JAIFRIEND</p>
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
            
            {/* Avatar Images */}
            <div className="w-full mb-8">
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 px-4">
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
            <div className="flex justify-center items-center space-x-3 sm:space-x-4 mb-8 overflow-x-auto pb-2 px-4">
              {avatars.slice(0, 4).map((avatar: Avatar, i: number) => (
                <button key={i} className="text-sm text-gray-600 hover:text-blue-500 transition-colors flex-shrink-0 font-medium">
                  {avatar.name}
                </button>
              ))}
              {avatars.length > 4 && (
                <span className="text-sm text-gray-400">
                  +{avatars.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Login Form */}
          <div className="w-full max-w-lg mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-16 lg:mb-20 border border-white/20 dark:border-gray-700/50 transition-all duration-300 hover:shadow-3xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-400">Sign in to your account to continue</p>
            </div>
            
            <div className="flex mb-8 w-full bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
              <button
                className={`flex-1 py-3 px-4 text-center font-semibold transition-all duration-300 relative rounded-xl ${
                  loginType === 'username'
                    ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                onClick={() => setLoginType('username')}
              >
                Email Login
              </button>
              <button
                className={`flex-1 py-3 px-4 text-center font-semibold transition-all duration-300 relative rounded-xl ${
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base backdrop-blur-sm"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberDevice"
                      id="rememberDevice"
                      checked={formData.rememberDevice}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Remember this device
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="text-center pt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
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
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
                <button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <button className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.02-1.53-.88-3.11-.88-1.59 0-1.83.86-3.11.88-1.28.02-2.22-1.18-3.05-2.47C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-16 lg:mb-20 w-full">
            <div className="space-y-10 order-2 lg:order-1">
              <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                  Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Jaifriend?</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Experience the next generation of social networking with cutting-edge features
                </p>
              </div>

              <div className="space-y-8">
                <div className="group flex items-start space-x-6 p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-xl">SHARE & CONNECT</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">Share what's new and life moments with your friends in real-time.</p>
                  </div>
                </div>

                <div className="group flex items-start space-x-6 p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-xl">DISCOVER</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">Discover new people, create meaningful connections and make lifelong friends.</p>
                  </div>
                </div>

                <div className="group flex items-start space-x-6 p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-xl">100% PRIVACY</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">You have complete control over your personal information and privacy settings.</p>
                  </div>
                </div>

                <div className="group flex items-start space-x-6 p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-xl">MAXIMUM SECURITY</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">Your account is fully secure with end-to-end encryption. We never share your data.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2 w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-3xl"></div>
              <div className="relative grid grid-cols-3 gap-6 sm:gap-8 p-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50">
                {/* Feature Icons - Top Row */}
                <div className="group w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className="group w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <div className="group w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>

                {/* Middle Row */}
                <div className="group w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="group w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="group w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>

                {/* Bottom Row */}
                <div className="group w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <div className="group w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div className="group w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2v-7.5c0-.83.67-1.5 1.5-1.5S12 9.67 12 10.5V11h2.5c.83 0 1.5.67 1.5 1.5V18h2v-5.5c0-1.1-.9-2-2-2H13.5v-.5c0-1.38-1.12-2.5-2.5-2.5S8.5 8.62 8.5 10v.5H7c-.55 0-1 .45-1 1V18H4z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Trending Section - Full Width */}
        <section className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 lg:py-20 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10"></div>
          <div className="relative px-4 sm:px-6 lg:px-8 text-center w-full box-border">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-green-200 dark:border-gray-700 mb-8">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <p className="text-green-600 dark:text-green-400 font-bold tracking-wider text-sm uppercase">TRENDING NOW</p>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-16 lg:mb-20 leading-tight px-2">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                See what people are talking about
              </span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {trendingTags.map((tag: string, index: number) => (
                <div 
                  key={tag} 
                  className="group relative p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative text-center">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                      {tag}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">
                      {Math.floor(Math.random() * 1000) + 100} posts today
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Discover Section */}
        <div className="w-full px-4 py-16 lg:py-20 box-border">
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 lg:p-16 text-center mb-16 lg:mb-20 w-full border border-white/20 dark:border-gray-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-3xl"></div>
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Discover <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Jaifriend</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                Explore amazing features and connect with people from around the world
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="group text-center p-8 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-105">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-xl mb-3">Explore</h3>
                  <p className="text-gray-600 dark:text-gray-400">Discover new content, people, and communities</p>
                </div>
                
                <div className="group text-center p-8 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-105">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-xl mb-3">Forum</h3>
                  <p className="text-gray-600 dark:text-gray-400">Join discussions and share your thoughts</p>
                </div>
              </div>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400 text-base"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400 text-base"
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
                      if (response.isSetupDone) {
                        router.push('/dashboard');
                      } else {
                        router.push('/start-up');
                      }
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
              <span className="text-sm text-gray-600">Don't have an account?{' '}
                <button 
                  type="button" 
                  className="text-blue-500 hover:underline font-medium" 
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

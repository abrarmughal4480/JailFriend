'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useSystemThemeOverride } from '../../hooks/useSystemThemeOverride';


interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  agreeToTerms: boolean;
}

interface RegisterErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function Register(): React.ReactElement {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'Female',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when popup is open
  useEffect(() => {
    if (popup.isOpen) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      // Prevent scroll on mobile
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Re-enable scrolling
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [popup.isOpen]);

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
      // Redirect to start-up page for profile setup
      router.push('/start-up');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const target = e.target;
    const { name, value, type } = target;

    const checked = target instanceof HTMLInputElement ? target.checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name as keyof RegisterErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): RegisterErrors => {
    const newErrors: RegisterErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.username,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          gender: formData.gender
        })
      });
      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        showPopup('success', 'Registration Successful!', 'Your account has been created successfully. You will be redirected to complete your profile setup.');
      } else {
        showPopup('error', 'Registration Failed', data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setIsLoading(false);
      showPopup('error', 'Network Error', 'Unable to connect to the server. Please check your internet connection and try again.');
    }
  };

  if (!mounted) {
    return <div></div>;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      {/* Custom Popup Modal */}
      {popup.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                {popup.type === 'success' ? (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm border ${
                    isDarkMode 
                      ? 'bg-green-500/20 border-green-400/30' 
                      : 'bg-green-100/50 border-green-300/30'
                  }`}>
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm border ${
                    isDarkMode 
                      ? 'bg-red-500/20 border-red-400/30' 
                      : 'bg-red-100/50 border-red-300/30'
                  }`}>
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{popup.title}</h3>
                <p className={`mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>{popup.message}</p>
                
                {/* Button */}
                <button
                  onClick={closePopup}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
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

      {/* Navbar */}
      <nav className={`flex justify-between items-center px-4 sm:px-8 py-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'
      } border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <div className={`rounded-full p-2 ${
            isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
          }`}>
            <Image src="/globe.svg" alt="logo" width={32} height={32} />
          </div>
          <span className={`text-2xl font-bold ${
            isDarkMode ? 'text-blue-400' : 'text-blue-700'
          }`}>jaifriend</span>
        </div>
        <Link href="/" className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
          isDarkMode 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}>
          Login
        </Link>
      </nav>

      <main className="flex flex-col items-center justify-center flex-1 px-4 py-8">
        <div className="w-full max-w-lg">
          <div className={`rounded-3xl shadow-2xl p-8 border backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-gray-800/90 border-gray-700' 
              : 'bg-white/90 border-gray-200'
          }`}>
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <svg className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Create Account</h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Join our community and start connecting</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isDarkMode 
                        ? `text-white placeholder-gray-400 ${
                            errors.username 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                          }`
                        : `text-gray-700 placeholder-gray-500 ${
                            errors.username 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                          }`
                    }`}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                  {errors.username}
                </p>}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isDarkMode 
                        ? `text-white placeholder-gray-400 ${
                            errors.email 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                          }`
                        : `text-gray-700 placeholder-gray-500 ${
                            errors.email 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                          }`
                    }`}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                  {errors.email}
                </p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 bg-transparent focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isDarkMode 
                        ? `text-white placeholder-gray-400 ${
                            errors.password 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                          }`
                        : `text-gray-700 placeholder-gray-500 ${
                            errors.password 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                          }`
                    }`}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-xl transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                      </svg>
                    ) : (
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                  {errors.password}
                </p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 bg-transparent focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isDarkMode 
                        ? `text-white placeholder-gray-400 ${
                            errors.confirmPassword 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                          }`
                        : `text-gray-700 placeholder-gray-500 ${
                            errors.confirmPassword 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                          }`
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-xl transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                      </svg>
                    ) : (
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                  {errors.confirmPassword}
                </p>}
              </div>

              {/* Gender Field */}
              <div className="space-y-2">
                <label htmlFor="gender" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Gender
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-300 appearance-none cursor-pointer ${
                      isDarkMode 
                        ? 'text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-800' 
                        : 'text-gray-700 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white'
                    }`}
                  >
                    <option value="Female" className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}>Female</option>
                    <option value="Male" className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}>Male</option>
                    <option value="Other" className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}>Other</option>
                    <option value="Prefer not to say" className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}>Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className={`flex items-start space-x-3 p-4 rounded-xl border-2 border-dashed bg-opacity-50 ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className={`w-5 h-5 mt-0.5 text-blue-600 bg-transparent border-2 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200 ${
                      errors.agreeToTerms 
                        ? 'border-red-500' 
                        : isDarkMode 
                          ? 'border-gray-500' 
                          : 'border-gray-300'
                    }`}
                  />
                  <label htmlFor="agreeToTerms" className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    By creating your account, you agree to our{' '}
                    <a href="#" className={`font-medium underline transition-colors ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}>
                      Terms of Use
                    </a>{' '}
                    &{' '}
                    <a href="#" className={`font-medium underline transition-colors ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}>
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {errors.agreeToTerms && <p className="text-red-500 text-xs flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                  {errors.agreeToTerms}
                </p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl text-base mt-6 ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                    Create Account
                  </div>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <div className={`inline-flex items-center px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
                isDarkMode 
                  ? 'border-gray-600 hover:border-blue-500 bg-gray-800/50' 
                  : 'border-gray-200 hover:border-blue-300 bg-gray-50'
              }`}>
                <svg className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Already have an account?{' '}
                </span>
                <Link href="/" className={`ml-1 font-medium underline transition-colors ${
                  isDarkMode 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}>
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`text-center text-sm py-6 border-t ${
        isDarkMode 
          ? 'text-gray-400 bg-gray-800 border-gray-700' 
          : 'text-gray-500 bg-white border-gray-200'
      }`}>
        <div className="mb-2">
          © 2025 Jaifriend · Terms of Use · Privacy Policy · Contact Us · About · Directory · Forum · 🌐 Language
        </div>
      </footer>
    </div>
  );
}

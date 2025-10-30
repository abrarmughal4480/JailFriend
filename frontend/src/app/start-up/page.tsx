"use client";
import React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupUserApi, getSuggestedUsersApi } from '@/utils/api';
import { useDarkMode } from '@/contexts/DarkModeContext';

// Fallback users in case API fails
const fallbackUsers = [
  { name: "Daniel John", img: "/avatars/1.png.png" },
  { name: "Blanie William", img: "/avatars/2.png.png" },
  { name: "Bruce Lester", img: "/avatars/4.png.png" },
  { name: "Mark Johnson", img: "/avatars/7.png.png" },
  { name: "Elisa Johnson", img: "/avatars/19.png.png" },
  { name: "Jenny Miller", img: "/avatars/20.png.png" },
];

const steps = ["Media", "Info", "Follow"];

export default function StartUpPage() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [step, setStep] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState(fallbackUsers);
  const [usersLoading, setUsersLoading] = useState(false);
  const [savedSteps, setSavedSteps] = useState({
    step1: false, // Avatar selected
    step2: false, // Info filled
    step3: false  // Follow completed (optional)
  });
  const [popup, setPopup] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  // Show popup helper functions
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
  };

  // Save step data progressively to database
  const saveStepData = async (stepNumber: number, data: any) => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      console.log(`💾 Saving step ${stepNumber} data:`, data);
      
      // Send partial data to backend
      await setupUserApi(token, {
        avatar: stepNumber >= 1 ? (data.avatar || selectedAvatar || '') : '',
        fullName: stepNumber >= 2 ? (data.fullName || fullName || '') : '',
        bio: stepNumber >= 2 ? (data.bio || bio || '') : '',
        location: stepNumber >= 2 ? (data.location || location || '') : ''
      } as any);
      
      console.log(`✅ Step ${stepNumber} data saved successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to save step ${stepNumber}:`, error);
      return false;
    }
  };

  // Fetch real users from database
  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setUsersLoading(true);
    try {
      const response = await getSuggestedUsersApi(token);
      console.log('✅ Fetched real users:', response);
      
      if (response && response.users && response.users.length > 0) {
        // Transform API response to match our format
        const transformedUsers = response.users.map((user: any) => ({
          name: user.fullName || user.name || user.username || 'Unknown User',
          img: user.avatar || '/default-avatar.svg',
          userId: user._id || user.id
        }));
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      // Keep fallback users if API fails
      setUsers(fallbackUsers);
    } finally {
      setUsersLoading(false);
    }
  };

  // Check if user is authenticated and fetch users
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    } else {
      fetchUsers();
    }
  }, [router]);

  // Prevent zoom on mobile input focus
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventZoom);
    };
  }, []);

  const handleFinishSetup = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Validate form data
    if (!fullName.trim()) {
      showPopup('error', 'Validation Error', 'Please enter your full name');
      return;
    }

    if (!location.trim()) {
      showPopup('error', 'Validation Error', 'Please enter your location');
      return;
    }

    console.log('Saving user data:', {
      avatar: selectedAvatar || '',
      fullName: fullName.trim(),
      bio: bio.trim(),
      location: location.trim()
    });

    setIsLoading(true);
    try {
      await setupUserApi(token, {
        avatar: selectedAvatar || '',
        fullName: fullName.trim(),
        bio: bio.trim(),
        location: location.trim()
      });
      
      console.log('✅ User setup completed successfully');
      showPopup('success', 'Setup Complete!', 'Profile setup completed successfully!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Setup failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      showPopup('error', 'Setup Failed', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const nextSibling = target.nextSibling as HTMLElement;
    if (nextSibling) {
      nextSibling.style.display = 'flex';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-0 py-0 flex items-center justify-center min-h-screen">
        <div className={`rounded-xl sm:rounded-2xl shadow-xl flex flex-col lg:flex-row w-full overflow-hidden transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Left Panel */}
          <div className="bg-gray-200 flex flex-col lg:flex-col items-center justify-center lg:justify-between lg:w-1/4 lg:min-w-[200px] p-4 sm:p-6 lg:py-8 lg:px-6">
            <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 text-center mb-4 sm:mb-6 lg:mb-4">
              Follow our famous users.
            </div>
            <div className="hidden lg:flex w-full flex-1 items-end justify-center">
              <Image src="/illustration.svg" alt="illustration" width={120} height={60} />
            </div>
            <div className="lg:hidden flex justify-center">
              <Image src="/illustration.svg" alt="illustration" width={100} height={50} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Mobile Progress Bar */}
            <div className="lg:hidden mb-3 sm:mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-xs text-gray-600">
                Step {step + 1} of {steps.length}
              </div>
            </div>

            {/* Steps */}
            <div className="hidden lg:flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
              {steps.map((s, i) => (
                <React.Fragment key={s}>
                  <button
                    className={`px-2 sm:px-4 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                      step === i
                        ? "bg-orange-400 text-white"
                        : step > i
                        ? "bg-orange-200 text-orange-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    onClick={() => setStep(i)}
                  >
                    {s}
                  </button>
                  {i < steps.length - 1 && <span className="text-gray-400 text-xs sm:text-sm">&#9654;</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Step Content */}
            {step === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[350px] lg:min-h-[320px]">
                <div className="mb-4 sm:mb-6 text-gray-700 font-medium text-center text-sm sm:text-base px-2 sm:px-4">
                  Upload your profile media (photo/avatar).
                </div>
                <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-blue-300">
                    {selectedAvatar ? (
                      <Image 
                        src={selectedAvatar} 
                        alt="avatar" 
                        width={96} 
                        height={96}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    {!selectedAvatar && (
                      <span className="text-gray-400 text-xs sm:text-sm text-center px-2">No avatar selected</span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-4 sm:gap-3 justify-center w-full max-w-xs sm:max-w-sm md:max-w-md px-2">
                    {users.slice(0, 8).map((user, i) => (
                      <button
                        key={i}
                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${selectedAvatar === user.img ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}
                        onClick={() => setSelectedAvatar(user.img)}
                        type="button"
                      >
                        <Image 
                          src={user.img} 
                          alt={user.name} 
                          width={48} 
                          height={48}
                          onError={handleImageError}
                          className="w-full h-full object-cover"
                        />
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600" style={{display: 'none'}}>
                          {user.name.charAt(0)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="mt-4 sm:mt-6 md:mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 w-full max-w-xs sm:max-w-sm"
                  onClick={async () => {
                    if (selectedAvatar) {
                      const saved = await saveStepData(1, { avatar: selectedAvatar });
                      if (saved) {
                        setSavedSteps(prev => ({ ...prev, step1: true }));
                        setStep(1);
                      }
                    } else {
                      showPopup('error', 'Avatar Required', 'Please select an avatar before proceeding');
                    }
                  }}
                >
                  Next
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] lg:min-h-[320px]">
                <div className="mb-4 sm:mb-6 text-gray-700 font-medium text-center text-sm sm:text-base px-2 sm:px-4">
                  Fill in your info to continue.
                </div>
                <form className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col gap-3 sm:gap-4 p-4 px-2 sm:px-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <textarea 
                    placeholder="Bio (Tell us about yourself)" 
                    rows={3}
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Location (City, Country)" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </form>
                <div className="flex gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8 w-full max-w-xs sm:max-w-sm md:max-w-md px-2 sm:px-4">
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
                      if (!fullName.trim() || !location.trim()) {
                        showPopup('error', 'Required Fields', 'Please fill in your full name and location before proceeding');
                        return;
                      }
                      
                      const saved = await saveStepData(2, { 
                        avatar: selectedAvatar, 
                        fullName: fullName.trim(), 
                        bio: bio.trim(), 
                        location: location.trim() 
                      });
                      
                      if (saved) {
                        setSavedSteps(prev => ({ ...prev, step2: true }));
                        setStep(2);
                      }
                    }}
                    disabled={!fullName.trim() || !location.trim()}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                <div className="text-center mb-3 sm:mb-4 md:mb-6 text-gray-700 font-medium text-sm sm:text-base px-2 sm:px-4">
                  Get latest activities from our popular users.
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6 px-1 sm:px-2 max-h-[250px] sm:max-h-[300px] md:max-h-[400px] overflow-y-auto">
                  {usersLoading ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center border border-gray-200 rounded-lg p-1 sm:p-2 md:p-3 bg-gray-100 animate-pulse">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-gray-300 mb-1 sm:mb-2"></div>
                        <div className="w-16 h-3 bg-gray-300 rounded"></div>
                      </div>
                    ))
                  ) : (
                    users.map((user, i) => (
                      <button 
                        key={i} 
                        className="flex flex-col items-center border border-gray-200 rounded-lg p-1 sm:p-2 md:p-3 bg-white hover:bg-blue-50 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-gray-100 mb-1 sm:mb-2 flex items-center justify-center">
                          <Image 
                            src={user.img} 
                            alt={user.name} 
                            width={56} 
                            height={56}
                            onError={handleImageError}
                            className="w-full h-full object-cover"
                          />
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600" style={{display: 'none'}}>
                            {user.name.charAt(0)}
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate w-full text-center px-1">
                          {user.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-0 mt-2 sm:mt-3 md:mt-2 px-1 sm:px-2">
                  <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left sm:pl-1">
                    Or <button 
                      className="underline hover:text-blue-600 transition-colors duration-200"
                      onClick={async () => {
                        // Skip step 3 and complete setup
                        const saved = await saveStepData(3, { 
                          avatar: selectedAvatar, 
                          fullName: fullName.trim(), 
                          bio: bio.trim(), 
                          location: location.trim(),
                          skipped: true
                        });
                        
                        if (saved) {
                          setSavedSteps(prev => ({ ...prev, step3: true }));
                          alert('Profile setup completed! You can follow users later.');
                          router.push('/dashboard');
                        }
                      }}
                    >
                      Skip this step for now.
                    </button>
                  </span>
                  <button 
                    onClick={async () => {
                      // Complete step 3 with following users
                      const saved = await saveStepData(3, { 
                        avatar: selectedAvatar, 
                        fullName: fullName.trim(), 
                        bio: bio.trim(), 
                        location: location.trim(),
                        skipped: false
                      });
                      
                      if (saved) {
                        setSavedSteps(prev => ({ ...prev, step3: true }));
                        alert('Profile setup completed! Welcome to the community!');
                        router.push('/dashboard');
                      }
                    }}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {isLoading ? 'Setting up...' : 'Follow 20 & Finish'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

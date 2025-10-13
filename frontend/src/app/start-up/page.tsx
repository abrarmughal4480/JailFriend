"use client";
import React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupUserApi } from '@/utils/api';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { useDarkMode } from '@/contexts/DarkModeContext';

const users = [
  { name: "Daniel John", img: "/avatars/1.png.png" },
  { name: "Blanie William", img: "/avatars/2.png.png" },
  { name: "suicideboys ...", img: "/avatars/3.png.png" },
  { name: "Bruce Lester", img: "/avatars/4.png.png" },
  { name: "ProZenith", img: "/avatars/5.pmg.png" }, // This file exists with this name
  { name: "Amazing Indi...", img: "/avatars/6.png.png" },
  { name: "Mark Johnson", img: "/avatars/7.png.png" },
  { name: "Vouchr it", img: "/avatars/8.png.png" },
  { name: "themindfulm...", img: "/avatars/9.png.png" },
  { name: "rodwavemerch", img: "/avatars/10.png" },
  { name: "Rashmika Soni", img: "/avatars/11.png.png" },
  { name: "Jiten Patel", img: "/avatars/12.png.png" },
  { name: "unitecleansi...", img: "/avatars/13.png.png" },
  { name: "jer 123", img: "/avatars/14.png.png" },
  { name: "Chander Deep", img: "/avatars/15.png.png" },
  { name: "komalsharma", img: "/avatars/16.png.png" },
  { name: "RMC Elite", img: "/avatars/17.png.png" },
  { name: "mmmrssteamer", img: "/avatars/18.png.png" },
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

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
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

    console.log('Token being sent:', token); // Debug log

    setIsLoading(true);
    try {
      await setupUserApi(token, {
        avatar: selectedAvatar || '',
        fullName,
        bio,
        location
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Setup failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert(`Setup failed: ${error.response?.data?.message || error.message}`);
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
    <ResponsiveContainer>
      <div className={`min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-8 transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`rounded-xl sm:rounded-2xl shadow-xl flex flex-col lg:flex-row w-full max-w-5xl overflow-hidden transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Left Panel */}
          <div className="bg-gray-200 flex flex-col lg:flex-col items-center justify-between lg:w-1/4 lg:min-w-[180px] p-4 lg:py-8 lg:px-4">
            <div className="text-base lg:text-lg font-semibold text-gray-700 text-center mb-4 lg:mb-4">
              Follow our famous users.
            </div>
            <div className="hidden lg:flex w-full flex-1 items-end justify-center">
              <Image src="/illustration.svg" alt="illustration" width={120} height={60} />
            </div>
            <div className="lg:hidden flex justify-center">
              <Image src="/illustration.svg" alt="illustration" width={80} height={40} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* Mobile Progress Bar */}
            <div className="lg:hidden mb-4">
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
            <div className="hidden lg:flex items-center justify-center gap-1 sm:gap-2 mb-6">
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
              <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px]">
                <div className="mb-6 text-gray-700 font-medium text-center text-sm sm:text-base px-4">
                  Upload your profile media (photo/avatar).
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-blue-300">
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
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 justify-center max-w-sm sm:max-w-md">
                    {users.slice(0, 8).map((user, i) => (
                      <button
                        key={i}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${selectedAvatar === user.img ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}
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
                  className="mt-6 sm:mt-8 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={() => setStep(1)}
                >
                  Next
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px]">
                <div className="mb-6 text-gray-700 font-medium text-center text-sm sm:text-base px-4">
                  Fill in your info to continue.
                </div>
                <form className="w-full max-w-sm sm:max-w-md flex flex-col gap-4 px-4 sm:px-0">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className={`border rounded-lg px-4 py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                    className={`border rounded-lg px-4 py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
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
                    className={`border rounded-lg px-4 py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </form>
                <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8 w-full max-w-sm sm:max-w-md px-4 sm:px-0">
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => setStep(2)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                <div className="text-center mb-4 sm:mb-6 text-gray-700 font-medium text-sm sm:text-base px-4">
                  Get latest activities from our popular users.
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6 px-2 sm:px-0 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                  {users.map((user, i) => (
                    <button 
                      key={i} 
                      className="flex flex-col items-center border border-gray-200 rounded-lg p-2 sm:p-3 bg-white hover:bg-blue-50 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gray-100 mb-2 flex items-center justify-center">
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
                      <span className="text-xs font-medium text-gray-700 truncate w-16 sm:w-20 text-center">
                        {user.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 mt-4 sm:mt-2 px-2 sm:px-0">
                  <span className="text-xs text-gray-500 text-center sm:text-left sm:pl-1">
                    Or <button 
                      className="underline hover:text-blue-600 transition-colors duration-200"
                      onClick={() => router.push('/dashboard')}
                    >
                      Skip this step for now.
                    </button>
                  </span>
                  <button 
                    onClick={handleFinishSetup}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {isLoading ? 'Setting up...' : 'Follow 20 & Finish'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
}

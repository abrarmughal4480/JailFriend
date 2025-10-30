import React from 'react';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface ProfileDropdownProps {
  profile: {
    avatar?: string;
    fullName?: string;
  };
}

export default function ProfileDropdown({ profile }: ProfileDropdownProps) {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className={`absolute right-0 top-12 w-64 sm:w-80 rounded-2xl shadow-2xl z-50 p-3 sm:p-4 flex flex-col gap-2 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Profile Section */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <img
          src={profile.avatar ? (profile.avatar.startsWith('http') ? profile.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/${profile.avatar}`) : "/default-avatar.svg"}
          alt="avatar"
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border object-cover ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
          onError={(e) => {
            console.log('❌ Avatar load failed for profile:', profile.fullName, 'URL:', profile.avatar);
            e.currentTarget.src = '/default-avatar.svg';
          }}
        />
        <div className="flex flex-col">
          <span className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.fullName || 'My Profile'}</span>
          <div className="flex gap-1 sm:gap-2 mt-1">
            <span className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              <span role="img" aria-label="wallet">💳</span> <span className="hidden sm:inline">$0.00</span>
            </span>
            <span className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              <span role="img" aria-label="pokes">👍</span> <span className="hidden sm:inline">Pokes</span>
            </span>
          </div>
        </div>
      </div>
      {/* Menu Items */}
      <div className={`flex flex-col gap-1 divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
        <button className={`flex items-center gap-2 sm:gap-3 py-2 rounded-lg px-2 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}>
          <span className={`p-1.5 sm:p-2 rounded-full text-base sm:text-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>🔄</span>
          <span className="font-medium text-sm sm:text-base">Switch Account</span>
        </button>
        <div className="py-1" />
        <button className={`flex items-center gap-2 sm:gap-3 py-2 rounded-lg px-2 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}>
          <span className={`p-1.5 sm:p-2 rounded-full text-base sm:text-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>🛠️</span>
          <span className="font-medium text-sm sm:text-base">Upgrade To Pro</span>
        </button>
        <button className="flex items-center gap-2 sm:gap-3 py-2 rounded-lg px-2 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}">
          <span className="p-1.5 sm:p-2 rounded-full text-base sm:text-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}">📢</span>
          <span className="font-medium text-sm sm:text-base">Advertising</span>
        </button>
        <button className="flex items-center gap-2 sm:gap-3 py-2 rounded-lg px-2 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}">
          <span className="p-1.5 sm:p-2 rounded-full text-base sm:text-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}">💳</span>
          <span className="font-medium text-sm sm:text-base">Subscriptions</span>
        </button>
        <div className="py-1" />
        <button className="flex items-center gap-2 sm:gap-3 py-2 rounded-lg px-2 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}">
          <span className="p-1.5 sm:p-2 rounded-full text-base sm:text-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}">✔️</span>
          <span className="font-medium text-sm sm:text-base">Privacy Setting</span>
        </button>
        <button className="flex items-center gap-2 sm:gap-3 py-2 rounded-lg px-2 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}">
          <span className="p-1.5 sm:p-2 rounded-full text-base sm:text-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}">⚙️</span>
          <span className="font-medium text-sm sm:text-base">General Setting</span>
        </button>
        <button className="flex items-center gap-2 sm:gap-3 py-2 rounded-lg px-2 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}">
          <span className="p-1.5 sm:p-2 rounded-full text-base sm:text-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}">✉️</span>
          <span className="font-medium text-sm sm:text-base">Invite Your Friends</span>
        </button>
        <div className="py-1" />
        <div className={`flex items-center gap-2 sm:gap-3 py-2 px-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <span className="p-1.5 sm:p-2 rounded-full text-base sm:text-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}">🌙</span>
          <span className="font-medium flex-1 text-sm sm:text-base">Night mode</span>
          <input type="checkbox" className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
        </div>
        <button className="flex items-center gap-2 sm:gap-3 py-2 rounded-lg px-2 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}">
          <span className="p-1.5 sm:p-2 rounded-full text-base sm:text-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}">🚪</span>
          <span className="font-medium text-sm sm:text-base">Log Out</span>
        </button>
      </div>
      {/* Footer */}
      <div className={`text-xs mt-2 sm:mt-3 flex flex-col items-center gap-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <div className="text-center">© 2025 Jaifriend <span className="mx-1">•</span> <span className="underline cursor-pointer">Language</span></div>
        <div className="flex flex-wrap gap-1 sm:gap-2 justify-center text-center">
          <span className="underline cursor-pointer text-xs">About</span>
          <span className="underline cursor-pointer text-xs">Directory</span>
          <span className="underline cursor-pointer text-xs">Contact Us</span>
          <span className="underline cursor-pointer text-xs">Developers</span>
          <span className="underline cursor-pointer text-xs">Privacy Policy</span>
          <span className="underline cursor-pointer text-xs">Terms of Use</span>
          <span className="underline cursor-pointer text-xs">Refund</span>
        </div>
      </div>
    </div>
  );
} 

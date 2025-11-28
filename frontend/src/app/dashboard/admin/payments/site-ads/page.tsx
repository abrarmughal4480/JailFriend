"use client";

import { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function AdvertisementSettings() {
  const { isDarkMode } = useDarkMode();
  const [adsSystemEnabled, setAdsSystemEnabled] = useState<boolean>(true);
  const [costByView, setCostByView] = useState<number>(0.01);
  const [costByClick, setCostByClick] = useState<number>(0.05);
  const [walletAmount, setWalletAmount] = useState<number>(10741);
  const [topUpAmount, setTopUpAmount] = useState<string>('');

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (topUpAmount && !isNaN(amount) && amount > 0) {
      setWalletAmount(prev => prev + amount);
      setTopUpAmount('');
      alert('Wallet topped up successfully!');
    } else {
      alert('Please enter a valid amount');
    }
  };

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";
  const textTertiary = isDarkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} py-4 sm:py-8 overflow-x-hidden transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 w-full">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div className="flex items-center">
                  <span className={isDarkMode ? "text-red-400" : "text-red-500"}>🏠</span>
                  <a href="#" className={`ml-2 text-sm font-medium ${isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"}`}>
                    Home
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className={textTertiary}>&gt;</span>
                  <a href="#" className={`ml-2 text-sm font-medium ${textTertiary} hover:${textSecondary}`}>
                    Advertisements
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className={textTertiary}>&gt;</span>
                  <span className={`ml-2 text-sm font-medium ${isDarkMode ? "text-red-400" : "text-red-500"}`}>
                    Advertisements System Settings
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className={`text-3xl font-bold ${textPrimary} mb-8 transition-colors duration-200`}>
            Advertisements System Settings
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Advertisement Settings */}
            <div className={`${cardBase} rounded-lg p-6 transition-colors duration-200`}>
              <h2 className={`text-xl font-semibold ${textPrimary} mb-6 transition-colors duration-200`}>
                Advertisements Settings
              </h2>

              {/* Advertisements System Toggle */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-medium ${textPrimary} mb-1 transition-colors duration-200`}>
                      Advertisements System
                    </h3>
                    <p className={`text-sm ${textSecondary} transition-colors duration-200`}>
                      Allow users to create ads.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => setAdsSystemEnabled(!adsSystemEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${isDarkMode ? "focus:ring-offset-gray-800" : ""} ${
                        adsSystemEnabled ? 'bg-teal-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full ${isDarkMode ? "bg-gray-200" : "bg-white"} transition-transform ${
                          adsSystemEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    {adsSystemEnabled && (
                      <svg className="ml-2 w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Cost By View */}
              <div className="mb-6">
                <label className={`block text-lg font-medium ${textPrimary} mb-2 transition-colors duration-200`}>
                  Cost By View
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costByView}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setCostByView(isNaN(value) ? 0 : value);
                  }}
                  className={`w-full px-3 py-2 border ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                      : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200`}
                />
                <p className={`text-sm ${textSecondary} mt-1 transition-colors duration-200`}>
                  Set a price for ads impressions.
                </p>
              </div>

              {/* Cost By Click */}
              <div className="mb-6">
                <label className={`block text-lg font-medium ${textPrimary} mb-2 transition-colors duration-200`}>
                  Cost By Click
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costByClick}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setCostByClick(isNaN(value) ? 0 : value);
                  }}
                  className={`w-full px-3 py-2 border ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                      : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200`}
                />
                <p className={`text-sm ${textSecondary} mt-1 transition-colors duration-200`}>
                  Set a price for ads clicks.
                </p>
              </div>
            </div>

            {/* Wallet Top Up */}
            <div className={`${cardBase} rounded-lg p-6 transition-colors duration-200`}>
              <h2 className={`text-xl font-semibold ${textPrimary} mb-6 transition-colors duration-200`}>
                Top Up Vicky bedardi yadav's Wallet
              </h2>

              <div className="mb-4">
                <label className={`block text-lg font-medium ${textPrimary} mb-2 transition-colors duration-200`}>
                  Amount
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={`w-full px-3 py-2 border ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                      : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200`}
                />
                <p className={`text-sm ${textSecondary} mt-2 transition-colors duration-200`}>
                  You can top your own wallet from here, set any number.
                </p>
              </div>

              <button
                onClick={handleTopUp}
                className={`w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isDarkMode ? "focus:ring-offset-gray-800" : ""}`}
              >
                Top Up
              </button>

              {/* Current Wallet Balance */}
              <div className={`mt-6 p-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-50"} rounded-md transition-colors duration-200`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${textSecondary} transition-colors duration-200`}>
                    Current Balance:
                  </span>
                  <span className={`text-lg font-bold ${textPrimary} transition-colors duration-200`}>
                    ₹{walletAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => alert('Settings saved successfully!')}
              className={`bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${isDarkMode ? "focus:ring-offset-gray-900" : ""}`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
  );
}

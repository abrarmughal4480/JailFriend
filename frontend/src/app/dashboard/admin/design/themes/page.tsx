"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Check } from "lucide-react";

const ThemesPage = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTheme, setActiveTheme] = useState("wondertag");

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";

  // Main Themes
  const mainThemes = [
    {
      id: "sunshine",
      name: "Sunshine",
      version: "v1.0",
      author: "Deen Doughouz",
      icon: (
        <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-3xl">☀️</span>
        </div>
      ),
    },
    {
      id: "wondertag",
      name: "Wondertag",
      version: "v2.9.1",
      author: "Kulvir Singh",
      icon: (
        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-yellow-300">#W</span>
        </div>
      ),
    },
    {
      id: "wowonder",
      name: "WoWonder",
      version: "v2.5",
      author: "Deen Doughouz",
      icon: (
        <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
          <span className="text-3xl text-white">?</span>
        </div>
      ),
    },
  ];

  // 3rd Party Themes
  const thirdPartyThemes = [
    {
      id: "wondertag-ultimate",
      name: "Wondertag - The Ultimate Theme",
      icon: (
        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-yellow-300">#W</span>
        </div>
      ),
    },
    {
      id: "wonderful",
      name: "Wonderful - Welcome Pages",
      icon: (
        <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center">
          <span className="text-3xl font-bold text-white">W</span>
        </div>
      ),
    },
  ];

  const handleActivateTheme = (themeId: string) => {
    setActiveTheme(themeId);
    alert(`Theme "${themeId}" activated successfully!`);
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>Themes</h1>
        <div
          className={`text-sm ${textSecondary} flex items-center space-x-2`}
        >
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            🏠
          </span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Design</span>
          <span>&gt;</span>
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            Themes
          </span>
        </div>
      </div>

      {/* Main Themes Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainThemes.map((theme) => {
            const isActive = activeTheme === theme.id;
            return (
              <div
                key={theme.id}
                className={`${cardBase} rounded-xl p-6`}
              >
                <div className="flex items-start gap-4 mb-4">
                  {theme.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-lg font-semibold ${textPrimary}`}>
                        {theme.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded">
                        {theme.version}
                      </span>
                    </div>
                    <p className={`text-sm ${textSecondary}`}>
                      Author: {theme.author}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleActivateTheme(theme.id)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-4 h-4" />
                      Activated
                    </>
                  ) : (
                    "Activate Theme"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3rd Party Themes Section */}
      <div>
        <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
          3rd Party Themes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {thirdPartyThemes.map((theme) => (
            <div
              key={theme.id}
              className={`${cardBase} rounded-xl p-6`}
            >
              <div className="flex items-start gap-4 mb-4">
                {theme.icon}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>
                    {theme.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  alert(`Redirecting to get "${theme.name}"...`);
                }}
                className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Get Theme
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemesPage;




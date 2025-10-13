"use client";
import React from 'react';

const AdminManageFeatures = () => {
  const featuresItems = [
    { name: "Enable / Disable Features", icon: "🔧", description: "Control which features are active on the platform" },
    { name: "Applications", icon: "📱", description: "Manage mobile and web applications" },
    { name: "Pages", icon: "📄", description: "Configure page settings and permissions" },
    { name: "Groups", icon: "👥", description: "Manage group features and settings" },
    { name: "Posts", icon: "📝", description: "Configure post creation and sharing features" },
    { name: "Fundings", icon: "💰", description: "Manage funding and donation features" },
    { name: "Jobs", icon: "💼", description: "Configure job posting and application features" },
    { name: "Offers", icon: "🎁", description: "Manage promotional offers and deals" },
    { name: "Articles (Blog)", icon: "📰", description: "Configure blog and article features" },
    { name: "Events", icon: "📅", description: "Manage event creation and management" },
    { name: "Content Monetization", icon: "💳", description: "Configure content monetization features" }
  ];

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Feature Management
        </h1>
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Home {'>'} Admin {'>'} <span className="text-red-500 dark:text-red-400 font-semibold">MANAGE FEATURES</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {featuresItems.map((item, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-lg sm:text-xl lg:text-2xl">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 dark:text-white truncate">{item.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors text-xs sm:text-sm">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageFeatures; 

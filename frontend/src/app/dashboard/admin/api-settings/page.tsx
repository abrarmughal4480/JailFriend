"use client";
import React from 'react';

const AdminAPISettings = () => {
  const apiItems = [
    { name: "Manage API Server Key", icon: "🔑", description: "Generate and manage API server keys" },
    { name: "Push Notifications Settings", icon: "🔔", description: "Configure push notification services", active: true },
    { name: "Verify Applications", icon: "✅", description: "Review and verify third-party applications" },
    { name: "3rd Party Scripts", icon: "📜", description: "Manage third-party integrations and scripts" }
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          API Settings Management
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Home {'>'} Admin {'>'} <span className="text-red-500 dark:text-red-400 font-semibold">API SETTINGS</span>
        </div>
      </div>

      {/* API Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apiItems.map((item, index) => (
          <div key={index} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer ${item.active ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${item.active ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-teal-100 dark:bg-teal-900/30'}`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{item.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                {item.active && (
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                    Active
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button className={`px-4 py-2 text-white rounded-lg transition-colors ${item.active ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700'}`}>
                {item.active ? 'Configure' : 'Manage'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAPISettings; 

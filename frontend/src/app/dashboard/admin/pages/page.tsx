"use client";
import React from 'react';

const AdminPages = () => {
  const pagesItems = [
    { name: "Manage Custom Pages", icon: "📝", description: "Create and manage custom pages" },
    { name: "Manage Terms Pages", icon: "📋", description: "Update terms of service and privacy policy" }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Page Management
        </h1>
        <div className="text-sm text-gray-600">
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">PAGES</span>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pagesItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPages; 

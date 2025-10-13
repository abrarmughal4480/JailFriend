"use client";
import React from 'react';

const AdminReports = () => {
  const reportsItems = [
    { name: "Manage Reports", icon: "📊", description: "View and manage user reports" },
    { name: "Manage Users Reports", icon: "👥", description: "Handle user-generated reports and complaints" }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Report Management
        </h1>
        <div className="text-sm text-gray-600">
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">REPORTS</span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports; 

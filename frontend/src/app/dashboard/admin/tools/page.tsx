"use client";
import React from 'react';

const AdminTools = () => {
  const toolsItems = [
    { name: "Manage Emails", icon: "📧", description: "Configure email templates and settings", active: true },
    { name: "Users Invitation", icon: "📨", description: "Manage user invitation system" },
    { name: "Send E-mail", icon: "📤", description: "Send bulk emails to users" },
    { name: "Announcements", icon: "📢", description: "Create and manage site announcements" },
    { name: "Auto Delete Data", icon: "🗑️", description: "Configure automatic data cleanup" },
    { name: "Auto Friend", icon: "🤝", description: "Manage automatic friend suggestions" },
    { name: "Auto Page Like", icon: "👍", description: "Configure automatic page liking" },
    { name: "Auto Group Join", icon: "👥", description: "Manage automatic group joining" },
    { name: "Fake User Generator", icon: "👤", description: "Generate test user accounts" },
    { name: "Mass Notifications", icon: "📢", description: "Send mass notifications to users" },
    { name: "BlackList", icon: "🚫", description: "Manage blacklisted users and content" },
    { name: "Generate SiteMap", icon: "🗺️", description: "Generate XML sitemap for SEO" },
    { name: "Invitation Codes", icon: "🎫", description: "Manage invitation code system" },
    { name: "Backup SQL & Files", icon: "💾", description: "Create database and file backups" }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Admin Tools
        </h1>
        <div className="text-sm text-gray-600">
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">TOOLS</span>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsItems.map((item, index) => (
          <div key={index} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${item.active ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${item.active ? 'bg-blue-100' : 'bg-orange-100'}`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                {item.active && (
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Active
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button className={`px-4 py-2 text-white rounded-lg transition-colors ${item.active ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                {item.active ? 'Configure' : 'Manage'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTools; 

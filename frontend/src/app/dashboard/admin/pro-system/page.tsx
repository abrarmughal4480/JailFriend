"use client";
import React from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/contexts/DarkModeContext';

const AdminProSystem = () => {
  const { isDarkMode } = useDarkMode();
  
  const proItems = [
    { name: "Pro System Settings", icon: "⚙️", description: "Configure pro system features and pricing", href: "/dashboard/admin/pro-system/settings" },
    { name: "Manage Payments", icon: "💳", description: "View and manage pro subscription payments", href: "/dashboard/admin/pro-system/payments" },
    { name: "Manage Members", icon: "👥", description: "Manage pro members and their benefits", href: "/dashboard/admin/pro-system/members" },
    { name: "Manage Refund Requests", icon: "↩️", description: "Process refund requests for pro subscriptions", href: "/dashboard/admin/pro-system/refunds" }
  ];

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
          Pro System Management
        </h1>
        <div className={`text-sm ${textSecondary}`}>
          Home {'>'} Admin {'>'} <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-semibold`}>PRO SYSTEM</span>
        </div>
      </div>

      {/* Pro System Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <div className={`${cardBase} rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'} rounded-lg flex items-center justify-center text-2xl`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>{item.name}</h3>
                  <p className={`text-sm ${textSecondary}`}>{item.description}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button className={`px-4 py-2 ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-lg transition-colors`}>
                  Manage
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminProSystem; 

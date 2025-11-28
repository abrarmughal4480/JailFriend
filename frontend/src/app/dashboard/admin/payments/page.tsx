"use client";
import React from 'react';
import Link from 'next/link';
import { 
  Settings, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Users, 
  Building2,
  Home 
} from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const AdminPayments = () => {
  const { isDarkMode } = useDarkMode();
  const paymentsItems = [
    { 
      name: "Payment Configuration", 
      icon: <Settings className="w-8 h-8" />, 
      description: "Configure payment gateways and settings",
      href: "/dashboard/admin/payments/config",
      color: "bg-blue-500"
    },
    { 
      name: "Advertisement Settings", 
      icon: <FileText className="w-8 h-8" />, 
      description: "Manage advertisement display settings",
      href: "/dashboard/admin/payments/ads",
      color: "bg-green-500"
    },
    { 
      name: "Manage Currencies", 
      icon: <DollarSign className="w-8 h-8" />, 
      description: "Add and manage supported currencies",
      href: "/dashboard/admin/payments/currencies",
      color: "bg-yellow-500"
    },
    { 
      name: "Manage Site Advertisements", 
      icon: <Building2 className="w-8 h-8" />, 
      description: "Control site-wide advertisements",
      href: "/dashboard/admin/payments/site-ads",
      color: "bg-purple-500"
    },
    { 
      name: "Manage User Advertisements", 
      icon: <Users className="w-8 h-8" />, 
      description: "Manage user-created advertisements",
      href: "/dashboard/admin/payments/user-ads",
      color: "bg-indigo-500"
    },
    { 
      name: "Manage Bank Receipts", 
      icon: <CreditCard className="w-8 h-8" />, 
      description: "Review and manage payment receipts",
      href: "/dashboard/admin/payments/receipts",
      color: "bg-red-500"
    }
  ];

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
          <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary} mb-2`}>
          Payments & Advertisement Management
        </h1>
          <div className={`text-sm ${textSecondary} flex items-center space-x-2`}>
            <span className={isDarkMode ? "text-red-400" : "text-red-500"}>🏠</span>
            <span>Home</span>
            <span>&gt;</span>
            <span>Payments & Ads</span>
            <span>&gt;</span>
            <span className={isDarkMode ? "text-red-400" : "text-red-500"}>Payments & Ads</span>
        </div>
      </div>

      {/* Payments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentsItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className={`${cardBase} rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group`}>
            <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-white transition-transform duration-200`}>
                {item.icon}
              </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${textPrimary} group-hover:${isDarkMode ? "text-blue-400" : "text-blue-600"} transition-colors`}>{item.name}</h3>
                <p className={`text-sm ${textSecondary}`}>{item.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Manage
              </button>
            </div>
          </div>
            </Link>
        ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPayments; 

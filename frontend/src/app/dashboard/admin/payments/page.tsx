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

const AdminPayments = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Payments & Advertisement Management
        </h1>
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
            <Home className="w-4 h-4 mr-1" />
          Home {'>'} Admin {'>'} <span className="text-red-500 dark:text-red-400 font-semibold">PAYMENTS & ADS</span>
        </div>
      </div>

      {/* Payments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentsItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-white transition-transform duration-200`}>
                {item.icon}
              </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
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

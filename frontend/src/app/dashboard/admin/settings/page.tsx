"use client";
import React from 'react';
import Link from 'next/link';
import { Settings, Mail, Users, Upload, Globe, MessageCircle, Info, Shield } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const AdminSettingsPage = () => {
  const { isDarkMode } = useDarkMode();
  const settingsCategories = [
    {
      title: 'General Settings',
      description: 'Configure basic website settings and preferences',
      icon: Settings,
      href: '/dashboard/admin/settings/general',
      color: 'bg-blue-500'
    },
    {
      title: 'Email & SMS Setup',
      description: 'Configure email server and SMS provider settings',
      icon: Mail,
      href: '/dashboard/admin/settings/email',
      color: 'bg-green-500'
    },
    {
      title: 'Social Settings',
      description: 'Manage social media integration and sharing',
      icon: Users,
      href: '/dashboard/admin/settings/social',
      color: 'bg-purple-500'
    },
    {
      title: 'Chat Settings',
      description: 'Configure chat system and messaging features',
      icon: MessageCircle,
      href: '/dashboard/admin/settings/chat',
      color: 'bg-orange-500'
    },
    {
      title: 'Upload Settings',
      description: 'Manage file upload configurations and limits',
      icon: Upload,
      href: '/dashboard/admin/settings/upload',
      color: 'bg-red-500'
    },
    {
      title: 'Website Mode',
      description: 'Configure website display mode and themes',
      icon: Globe,
      href: '/dashboard/admin/settings/website-mode',
      color: 'bg-indigo-500'
    },
    {
      title: 'Info Settings',
      description: 'Manage website information and metadata',
      icon: Info,
      href: '/dashboard/admin/settings/info',
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Admin Settings</h1>
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center space-x-2`}>
          <span className={isDarkMode ? 'text-red-400' : 'text-red-500'}>🏠</span>
          <span>Home</span>
          <span>&gt;</span>
          <span className={isDarkMode ? 'text-red-400' : 'text-red-500'}>Settings</span>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <Link 
              key={index} 
              href={category.href}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' : 'bg-white border-gray-200'} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border`}
            >
              <div className="flex items-center mb-4">
                <div className={`${category.color} p-3 rounded-lg mr-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
              </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{category.title}</h3>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{category.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSettingsPage; 

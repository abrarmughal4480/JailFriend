"use client";
import React, { useState } from 'react';
import { Globe, Moon, Sun, Monitor, Smartphone } from 'lucide-react';

const WebsiteModeSettings = () => {
  // Display Mode
  const [defaultTheme, setDefaultTheme] = useState('light');
  const [enableDarkMode, setEnableDarkMode] = useState(true);
  const [autoThemeSwitch, setAutoThemeSwitch] = useState(false);
  
  // Layout Settings
  const [defaultLayout, setDefaultLayout] = useState('sidebar');
  const [enableResponsive, setEnableResponsive] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);
  
  // Content Display
  const [postsPerPage, setPostsPerPage] = useState('10');
  const [enableInfiniteScroll, setEnableInfiniteScroll] = useState(true);
  const [enableLazyLoading, setEnableLazyLoading] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Mode Settings</h1>
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <span className="text-red-500">🏠</span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span className="text-red-500">Website Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Display Mode */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Globe className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Display Mode</h2>
              </div>
          
          <div className="space-y-6">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Theme</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${defaultTheme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={defaultTheme === 'light'}
                    onChange={(e) => setDefaultTheme(e.target.value)}
                    className="mr-3"
                  />
                  <Sun className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium">Light Mode</span>
                </label>
                
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${defaultTheme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={defaultTheme === 'dark'}
                    onChange={(e) => setDefaultTheme(e.target.value)}
                    className="mr-3"
                  />
                  <Moon className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium">Dark Mode</span>
                    </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">Choose the default theme for your website.</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Dark Mode</label>
                <p className="text-xs text-gray-500">Allow users to switch between light and dark themes.</p>
                  </div>
              <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                  checked={enableDarkMode}
                  onChange={(e) => setEnableDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
                  </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto Theme Switch</label>
                <p className="text-xs text-gray-500">Automatically switch theme based on system preference.</p>
                </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoThemeSwitch}
                  onChange={(e) => setAutoThemeSwitch(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Monitor className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Layout Settings</h2>
              </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Layout</label>
              <select
                value={defaultLayout}
                onChange={(e) => setDefaultLayout(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sidebar">Sidebar Layout</option>
                <option value="topbar">Top Bar Layout</option>
                <option value="minimal">Minimal Layout</option>
                <option value="fullscreen">Fullscreen Layout</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Choose the default layout for your website.</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Responsive Design</label>
                <p className="text-xs text-gray-500">Optimize layout for different screen sizes.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableResponsive}
                  onChange={(e) => setEnableResponsive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Animations</label>
                <p className="text-xs text-gray-500">Show smooth transitions and animations.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAnimations}
                  onChange={(e) => setEnableAnimations(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Content Display */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Smartphone className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Content Display</h2>
                </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Posts Per Page</label>
                  <input
              type="number"
              value={postsPerPage}
              onChange={(e) => setPostsPerPage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              min="5"
              max="50"
            />
            <p className="text-xs text-gray-500 mt-1">Number of posts to display per page.</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Infinite Scroll</label>
              <p className="text-xs text-gray-500">Load more content automatically when scrolling.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableInfiniteScroll}
                onChange={(e) => setEnableInfiniteScroll(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Lazy Loading</label>
              <p className="text-xs text-gray-500">Load images and content as needed.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableLazyLoading}
                onChange={(e) => setEnableLazyLoading(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="mt-6 flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default WebsiteModeSettings; 

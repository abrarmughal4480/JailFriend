"use client";
import React, { useState } from 'react';
import { MessageCircle, Users, Bell, Shield } from 'lucide-react';

const ChatSettings = () => {
  // Chat Features
  const [enableChat, setEnableChat] = useState(true);
  const [enableGroupChat, setEnableGroupChat] = useState(true);
  const [enableVoiceChat, setEnableVoiceChat] = useState(false);
  const [enableVideoChat, setEnableVideoChat] = useState(false);
  
  // Chat Limits
  const [maxGroupSize, setMaxGroupSize] = useState('50');
  const [maxMessageLength, setMaxMessageLength] = useState('1000');
  const [messageRetention, setMessageRetention] = useState('30');
  
  // Notifications
  const [enableChatNotifications, setEnableChatNotifications] = useState(true);
  const [enableSoundNotifications, setEnableSoundNotifications] = useState(true);
  const [enablePushNotifications, setEnablePushNotifications] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Settings</h1>
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <span className="text-red-500">🏠</span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span className="text-red-500">Chat Settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Features */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <MessageCircle className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Chat Features</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                <label className="text-sm font-medium text-gray-700">Enable Chat</label>
                <p className="text-xs text-gray-500">Allow users to send private messages.</p>
                </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableChat}
                  onChange={(e) => setEnableChat(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Group Chat</label>
                <p className="text-xs text-gray-500">Allow users to create group conversations.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableGroupChat}
                  onChange={(e) => setEnableGroupChat(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Voice Chat</label>
                <p className="text-xs text-gray-500">Enable voice calling features.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableVoiceChat}
                  onChange={(e) => setEnableVoiceChat(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
        </div>

            <div className="flex items-center justify-between">
                <div>
                <label className="text-sm font-medium text-gray-700">Video Chat</label>
                <p className="text-xs text-gray-500">Enable video calling features.</p>
                </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableVideoChat}
                  onChange={(e) => setEnableVideoChat(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
          </div>
        </div>
      </div>

        {/* Chat Limits */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Users className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Chat Limits</h2>
        </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Group Size</label>
              <input
                type="number"
                value={maxGroupSize}
                onChange={(e) => setMaxGroupSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                min="2"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum number of users in a group chat.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Message Length</label>
              <input
                type="number"
                value={maxMessageLength}
                onChange={(e) => setMaxMessageLength(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                min="100"
                max="5000"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum characters allowed in a single message.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Retention (Days)</label>
              <input
                type="number"
                value={messageRetention}
                onChange={(e) => setMessageRetention(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="365"
              />
              <p className="text-xs text-gray-500 mt-1">How long to keep chat messages before deletion.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Bell className="w-6 h-6 text-orange-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Chat Notifications</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
            <div>
                <label className="text-sm font-medium text-gray-700">Chat Notifications</label>
                <p className="text-xs text-gray-500">Send notifications for new messages.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
              <input
                  type="checkbox"
                  checked={enableChatNotifications}
                  onChange={(e) => setEnableChatNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
            <div>
                <label className="text-sm font-medium text-gray-700">Sound Notifications</label>
                <p className="text-xs text-gray-500">Play sound for new messages.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
              <input
                  type="checkbox"
                  checked={enableSoundNotifications}
                  onChange={(e) => setEnableSoundNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
            <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-xs text-gray-500">Send push notifications to mobile devices.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
              <input
                  type="checkbox"
                  checked={enablePushNotifications}
                  onChange={(e) => setEnablePushNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
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

export default ChatSettings; 

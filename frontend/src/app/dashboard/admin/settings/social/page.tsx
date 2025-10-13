"use client";
import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const SocialSettings = () => {
  // Social Media Links
  const [facebookUrl, setFacebookUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  // Social Features
  const [enableSocialLogin, setEnableSocialLogin] = useState(true);
  const [enableSocialSharing, setEnableSocialSharing] = useState(true);
  const [enableSocialComments, setEnableSocialComments] = useState(true);
  
  // Social Login Providers
  const [facebookLogin, setFacebookLogin] = useState(false);
  const [googleLogin, setGoogleLogin] = useState(true);
  const [twitterLogin, setTwitterLogin] = useState(false);
  
  // API Keys
  const [facebookAppId, setFacebookAppId] = useState('');
  const [facebookAppSecret, setFacebookAppSecret] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [twitterApiKey, setTwitterApiKey] = useState('');
  const [twitterApiSecret, setTwitterApiSecret] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Settings</h1>
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <span className="text-red-500">🏠</span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span className="text-red-500">Social Settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Media Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Share2 className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Social Media Links</h2>
          </div>
          
          <div className="space-y-6">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Facebook className="w-4 h-4 text-blue-600 mr-2" />
                Facebook URL
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Twitter className="w-4 h-4 text-blue-400 mr-2" />
                Twitter URL
              </label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Instagram className="w-4 h-4 text-pink-600 mr-2" />
                Instagram URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Linkedin className="w-4 h-4 text-blue-700 mr-2" />
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Youtube className="w-4 h-4 text-red-600 mr-2" />
                YouTube URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
              </div>
            </div>

        {/* Social Features */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Share2 className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Social Features</h2>
            </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Social Login</label>
                <p className="text-xs text-gray-500">Allow users to login with social media accounts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSocialLogin}
                  onChange={(e) => setEnableSocialLogin(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Social Sharing</label>
                <p className="text-xs text-gray-500">Allow users to share content on social media.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSocialSharing}
                  onChange={(e) => setEnableSocialSharing(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Social Comments</label>
                <p className="text-xs text-gray-500">Allow social media comments on posts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSocialComments}
                  onChange={(e) => setEnableSocialComments(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              </div>
            </div>
          </div>
        </div>

      {/* Social Login Providers */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Login Providers</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Facebook className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Facebook Login</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={facebookLogin}
                  onChange={(e) => setFacebookLogin(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook App ID</label>
                  <input
                    type="text"
                    value={facebookAppId}
                onChange={(e) => setFacebookAppId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Facebook App ID"
                  />
                </div>
            
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook App Secret</label>
                  <input
                type="password"
                    value={facebookAppSecret}
                onChange={(e) => setFacebookAppSecret(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Facebook App Secret"
                  />
                </div>
              </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-500 rounded mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Google Login</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={googleLogin}
                  onChange={(e) => setGoogleLogin(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Client ID</label>
                  <input
                    type="text"
                    value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Google Client ID"
                  />
                </div>
                
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Client Secret</label>
                  <input
                    type="password"
                    value={googleClientSecret}
                onChange={(e) => setGoogleClientSecret(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Google Client Secret"
                  />
              </div>
            </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Twitter className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Twitter Login</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                  <input
                  type="checkbox"
                  checked={twitterLogin}
                  onChange={(e) => setTwitterLogin(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter API Key</label>
                  <input
                    type="text"
                value={twitterApiKey}
                onChange={(e) => setTwitterApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Twitter API Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter API Secret</label>
                  <input
                type="password"
                value={twitterApiSecret}
                onChange={(e) => setTwitterApiSecret(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Twitter API Secret"
              />
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

export default SocialSettings; 

"use client";
import React, { useState } from 'react';
import { Info, FileText, Search, Globe } from 'lucide-react';

const InfoSettings = () => {
  // Website Information
  const [websiteTitle, setWebsiteTitle] = useState('JaiFriend - Connect with Friends');
  const [websiteDescription, setWebsiteDescription] = useState('A social networking platform to connect with friends and family');
  const [websiteKeywords, setWebsiteKeywords] = useState('social network, friends, family, connect, community');
  const [websiteAuthor, setWebsiteAuthor] = useState('JaiFriend Team');
  
  // Contact Information
  const [contactEmail, setContactEmail] = useState('contact@jaifriend.com');
  const [contactPhone, setContactPhone] = useState('+1-555-123-4567');
  const [contactAddress, setContactAddress] = useState('123 Social Street, Network City, NC 12345');
  
  // Legal Information
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsOfService, setTermsOfService] = useState('');
  const [cookiePolicy, setCookiePolicy] = useState('');
  const [copyrightText, setCopyrightText] = useState('© 2024 JaiFriend. All rights reserved.');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Info Settings</h1>
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <span className="text-red-500">🏠</span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span className="text-red-500">Info Settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Website Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Info className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Website Information</h2>
        </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website Title</label>
              <input
                type="text"
                value={websiteTitle}
                onChange={(e) => setWebsiteTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter website title"
              />
              <p className="text-xs text-gray-500 mt-1">The main title that appears in browser tabs and search results.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website Description</label>
              <textarea
                value={websiteDescription}
                onChange={(e) => setWebsiteDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter website description"
              />
              <p className="text-xs text-gray-500 mt-1">A brief description of your website for search engines.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website Keywords</label>
              <input
                type="text"
                value={websiteKeywords}
                onChange={(e) => setWebsiteKeywords(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter keywords separated by commas"
              />
              <p className="text-xs text-gray-500 mt-1">Keywords that describe your website content.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website Author</label>
              <input
                type="text"
                value={websiteAuthor}
                onChange={(e) => setWebsiteAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter website author"
              />
              <p className="text-xs text-gray-500 mt-1">The author or organization behind the website.</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Globe className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter contact email"
              />
              <p className="text-xs text-gray-500 mt-1">Primary email address for contact inquiries.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter contact phone"
              />
              <p className="text-xs text-gray-500 mt-1">Phone number for contact inquiries.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Address</label>
              <textarea
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter contact address"
              />
              <p className="text-xs text-gray-500 mt-1">Physical address for contact information.</p>
            </div>
          </div>
                </div>
              </div>

      {/* Legal Information */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FileText className="w-6 h-6 text-red-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Legal Information</h2>
              </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Policy</label>
              <textarea
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter privacy policy content or URL"
              />
              <p className="text-xs text-gray-500 mt-1">Privacy policy content or URL to your privacy policy page.</p>
              </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms of Service</label>
              <textarea
                value={termsOfService}
                onChange={(e) => setTermsOfService(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter terms of service content or URL"
              />
              <p className="text-xs text-gray-500 mt-1">Terms of service content or URL to your terms page.</p>
                </div>
              </div>

          <div className="space-y-6">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cookie Policy</label>
              <textarea
                value={cookiePolicy}
                onChange={(e) => setCookiePolicy(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter cookie policy content or URL"
              />
              <p className="text-xs text-gray-500 mt-1">Cookie policy content or URL to your cookie policy page.</p>
              </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
                <input
                  type="text"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter copyright text"
              />
              <p className="text-xs text-gray-500 mt-1">Copyright notice displayed on your website.</p>
            </div>
          </div>
                </div>
              </div>

      {/* SEO Preview */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Search className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">SEO Preview</h2>
              </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="text-blue-600 text-sm font-medium truncate">
              {websiteTitle || 'Website Title'}
                </div>
            <div className="text-green-600 text-sm">
              {window?.location?.origin || 'https://jaifriend.com'}
              </div>
            <div className="text-gray-600 text-sm">
              {websiteDescription || 'Website description will appear here...'}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            This is how your website might appear in search engine results.
          </p>
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

export default InfoSettings; 

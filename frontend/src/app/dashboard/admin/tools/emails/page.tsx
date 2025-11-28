"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface EmailTemplate {
  id: string;
  name: string;
  placeholders: string[];
  content: string;
}

const ManageEmails = () => {
  const { isDarkMode } = useDarkMode();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'activate-account': true,
    'invite-email': false,
    'login-with': false,
    'notification': false,
    'payment-declined': false,
    'payment-approved': false,
    'recover': false,
    'unusual-login': false,
    'account-deleted': false,
  });

  const [emailTemplates, setEmailTemplates] = useState<Record<string, string>>({
    'activate-account': '',
    'invite-email': 'You have received an invitation request from your friend {{NAME}} to join our social network community {{SITE_NAME}}.\n\nLet\'s contact & find your friends!\n\n{{SITE_NAME}} Team.\n\nBest regards.',
    'login-with': '',
    'notification': '',
    'payment-declined': '',
    'payment-approved': '',
    'recover': '',
    'unusual-login': '',
    'account-deleted': '',
  });

  const emailSections: Array<{
    id: string;
    name: string;
    placeholders: string[];
  }> = [
    {
      id: 'activate-account',
      name: 'Activate Account (HTML Allowed)',
      placeholders: ['{{USERNAME}}', '{{SITE_URL}}', '{{EMAIL}}', '{{CODE}}', '{{SITE_NAME}}'],
    },
    {
      id: 'invite-email',
      name: 'Invite Email (HTML Allowed)',
      placeholders: ['{{USERNAME}}', '{{SITE_URL}}', '{{NAME}}', '{{URL}}', '{{SITE_NAME}}', '{{BACKGOUND_COLOR}}'],
    },
    {
      id: 'login-with',
      name: 'Login With (HTML Allowed)',
      placeholders: ['{{FIRST_NAME}}', '{{SITE_NAME}}', '{{USERNAME}}', '{{EMAIL}}'],
    },
    {
      id: 'notification',
      name: 'Notification (HTML Allowed)',
      placeholders: ['{{SITE_NAME}}', '{{NOTIFY_URL}}', '{{NOTIFY_AVATAR}}', '{{NOTIFY_NAME}}', '{{TEXT_TYPE}}', '{{TEXT}}', '{{URL}}'],
    },
    {
      id: 'payment-declined',
      name: 'Payment Declined (HTML Allowed)',
      placeholders: ['{{name}}', '{{amount}}', '{{site_name}}'],
    },
    {
      id: 'payment-approved',
      name: 'Payment Approved (HTML Allowed)',
      placeholders: ['{{name}}', '{{amount}}', '{{site_name}}'],
    },
    {
      id: 'recover',
      name: 'Recover (HTML Allowed)',
      placeholders: ['{{USERNAME}}', '{{SITE_NAME}}', '{{LINK}}'],
    },
    {
      id: 'unusual-login',
      name: 'Unusual Login (HTML Allowed)',
      placeholders: ['{{USERNAME}}', '{{SITE_NAME}}', '{{CODE}}', '{{DATE}}', '{{EMAIL}}', '{{COUNTRY_CODE}}', '{{IP_ADDRESS}}', '{{CITY}}'],
    },
    {
      id: 'account-deleted',
      name: 'Account Deleted (HTML Allowed)',
      placeholders: ['{{USERNAME}}', '{{SITE_NAME}}'],
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleContentChange = (id: string, content: string) => {
    setEmailTemplates(prev => ({
      ...prev,
      [id]: content,
    }));
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Manage Emails
        </h1>
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Home {'>'} Tools {'>'} <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manage Emails</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={`rounded-lg shadow-sm border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Edit System E-mails
          </h2>

          {/* Info Banner */}
          <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${isDarkMode ? 'bg-green-900/20 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-800'}`}>
            <p className="text-sm">
              If you want to add translated texts you can use {'{'} {'{'}LANG key{'}'} {'}'} and replace key word with the key from Languages.
            </p>
          </div>

          {/* Email Sections */}
          <div className="space-y-4">
            {emailSections.map((section) => (
              <div
                key={section.id}
                className={`border rounded-lg transition-colors duration-200 ${
                  isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full px-6 py-4 flex items-center justify-between hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <h3 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {section.name}
                  </h3>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ${
                      expandedSections[section.id] ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Section Content */}
                {expandedSections[section.id] && (
                  <div className="px-6 pb-6 space-y-4">
                    {/* Placeholder Info Banner */}
                    <div className={`p-3 rounded-lg border transition-colors duration-200 ${
                      isDarkMode ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    }`}>
                      <p className="text-sm">
                        Make sure to add {section.placeholders.join(' , ')} in the right place
                      </p>
                    </div>

                    {/* Rich Text Editor Toolbar */}
                    <div className={`border rounded-t-lg transition-colors duration-200 ${
                      isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-300 bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-2 p-2 flex-wrap">
                        {/* Toolbar Buttons */}
                        <div className="flex items-center gap-1 border-r pr-2 mr-2">
                          <button
                            type="button"
                            className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                            }`}
                            title="Bold"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 4a1 1 0 011 1v4a1 1 0 01-2 0V5a1 1 0 011-1zm9 0a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1zM5 12a1 1 0 100 2h10a1 1 0 100-2H5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                            }`}
                            title="Italic"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 4h4M8 16h4M7 4l2 12" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                            }`}
                            title="Underline"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 4v6M15 4v6M3 16h14" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 border-r pr-2 mr-2">
                          <button
                            type="button"
                            className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                            }`}
                            title="Link"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                            }`}
                            title="Image"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 border-r pr-2 mr-2">
                          <button
                            type="button"
                            className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                            }`}
                            title="List"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>

                        {/* Upgrade Button */}
                        <div className="ml-auto">
                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 ${
                              isDarkMode
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            }`}
                          >
                            ⚡️ Upgrade
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Editor Textarea */}
                    <div className="relative">
                      <textarea
                        value={emailTemplates[section.id]}
                        onChange={(e) => handleContentChange(section.id, e.target.value)}
                        placeholder="Actionable emails e.g. reset password."
                        className={`w-full min-h-[300px] p-4 border rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                          isDarkMode
                            ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500'
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      {/* Editor Footer */}
                      <div className={`absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <span>p</span>
                        <span>{getWordCount(emailTemplates[section.id])} words</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEmails;




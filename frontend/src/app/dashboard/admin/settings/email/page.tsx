"use client";
import React, { useState } from 'react';
import { Info, AlertTriangle } from 'lucide-react';

const EmailSMSSetup = () => {
  // Email Configuration states
  const [emailServer, setEmailServer] = useState('SMTP Server');
  const [websiteDefaultEmail, setWebsiteDefaultEmail] = useState('Mail@jaifriend.com');
  const [smtpHost, setSmtpHost] = useState('jaifriend.com');
  const [smtpUsername, setSmtpUsername] = useState('mail@jaifriend.com');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpPort, setSmtpPort] = useState('465');
  const [smtpEncryption, setSmtpEncryption] = useState('TLS (Default, Not secured)');
  
  // Debug Email states
  const [debugLog, setDebugLog] = useState('Click on Debug Email Deliverability to show test results.');

  // SMS Settings states
  const [defaultSmsProvider, setDefaultSmsProvider] = useState('Twilio');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // BulkSMS Configuration states
  const [bulkSmsUsername, setBulkSmsUsername] = useState('');
  const [bulkSmsPassword, setBulkSmsPassword] = useState('');
  
  // Twilio Configuration states
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState('');
  
  // Infobip Configuration states
  const [infobipApiKey, setInfobipApiKey] = useState('');
  const [infobipBaseUrl, setInfobipBaseUrl] = useState('');
  
  // Msg91 Configuration states
  const [msg91AuthKey, setMsg91AuthKey] = useState('');
  const [msg91DltId, setMsg91DltId] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">E-mail & SMS Setup</h1>
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <span className="text-red-500">🏠</span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span className="text-red-500">E-mail & SMS Setup</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <span className="text-blue-800 text-sm font-medium">Info:</span>
            <span className="text-blue-800 text-sm ml-1">
              For more information on how to setup e-mail server or SMS providers, please visit our 
              <span className="text-blue-600 underline ml-1 cursor-pointer">Documentation</span> page.
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - E-mail Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">E-mail Configuration</h2>
          
          <div className="space-y-6">
            {/* E-mail Server */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail Server</label>
              <select
                value={emailServer}
                onChange={(e) => setEmailServer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="SMTP Server">SMTP Server</option>
                <option value="PHP Mail">PHP Mail</option>
                <option value="Sendmail">Sendmail</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Select which E-mail server you want to use, Server Mail function is not recommended.</p>
            </div>

            {/* Website Default E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website Default E-mail</label>
              <input
                type="email"
                value={websiteDefaultEmail}
                onChange={(e) => setWebsiteDefaultEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">This is your default website E-mail, this will be used to send E-mails to users.</p>
            </div>

            {/* SMTP Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Your SMTP account host name, can be IP, domain or subdomain.</p>
            </div>

            {/* SMTP Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
              <input
                type="text"
                value={smtpUsername}
                onChange={(e) => setSmtpUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Your SMTP account username.</p>
            </div>

            {/* SMTP Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
              
              {/* Warning Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-red-700 text-sm">The secret key is not showing due security reasons, you can still overwrite the current one.</p>
              </div>
              
              <input
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Your SMTP account password.</p>
            </div>

            {/* SMTP Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <input
                type="text"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Which port does your SMTP server use? most used 587 for TLS, and 465 for SSL encryption.</p>
            </div>

            {/* SMTP Encryption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Encryption</label>
              <select
                value={smtpEncryption}
                onChange={(e) => setSmtpEncryption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TLS (Default, Not secured)">TLS (Default, Not secured)</option>
                <option value="SSL">SSL</option>
                <option value="STARTTLS">STARTTLS</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Which encryption method does your SMTP server use?</p>
            </div>

            {/* Test Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                After clicking &quot;Test E-mail Server&quot;, a test message will be sent to your account&apos;s email address.
              </p>
            </div>

            {/* Test Button */}
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium">
              Test E-mail Server
            </button>
          </div>
        </div>

        {/* Right Column - Debug Email Deliverability */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Debug Email Deliverability</h2>
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              This feature will test the Email Deliverability and make sure the system is working fine.
            </p>
          </div>

          {/* Debug Log */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Debug Log</label>
            <textarea
              value={debugLog}
              onChange={(e) => setDebugLog(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              readOnly
            />
          </div>

          {/* Debug Button */}
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium">
            Debug Email Deliverability
          </button>
        </div>
      </div>

      {/* SMS Settings Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">SMS Settings</h2>
        
        {/* SMS Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            To start sending SMS, you have to create an account and buy credits in 
            <span className="text-blue-600 underline mx-1 cursor-pointer">Twilio</span>
            OR
            <span className="text-blue-600 underline mx-1 cursor-pointer">BulkSMS</span>
            OR
            <span className="text-blue-600 underline mx-1 cursor-pointer">Infobip</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - SMS Provider Selection */}
          <div className="space-y-6">
            {/* Default SMS Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default SMS Provider</label>
              <select
                value={defaultSmsProvider}
                onChange={(e) => setDefaultSmsProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Twilio">Twilio</option>
                <option value="BulkSMS">BulkSMS</option>
                <option value="Infobip">Infobip</option>
                <option value="Msg91">Msg91</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Select which SMS provider you want to use, you can use only one at the same time.</p>
            </div>

            {/* Your Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
              />
              <p className="text-xs text-gray-500 mt-1">Set your website default number, this will be used to send SMS to users, e.g (+9053..)</p>
            </div>

            {/* BulkSMS Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">BulkSMS Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BulkSMS Username</label>
                  <input
                    type="text"
                    value={bulkSmsUsername}
                    onChange={(e) => setBulkSmsUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BulkSMS Password</label>
                  <input
                    type="password"
                    value={bulkSmsPassword}
                    onChange={(e) => setBulkSmsPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Twilio Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Twilio Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twilio account_sid</label>
                  <input
                    type="text"
                    value={twilioAccountSid}
                    onChange={(e) => setTwilioAccountSid(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twilio auth_token</label>
                  <input
                    type="text"
                    value={twilioAuthToken}
                    onChange={(e) => setTwilioAuthToken(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twilio Phone number</label>
                  <input
                    type="text"
                    value={twilioPhoneNumber}
                    onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional SMS Configurations */}
          <div className="space-y-6">
            {/* Infobip Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Infobip Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Infobip API Key</label>
                  <input
                    type="text"
                    value={infobipApiKey}
                    onChange={(e) => setInfobipApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Infobip Base URL</label>
                  <input
                    type="text"
                    value={infobipBaseUrl}
                    onChange={(e) => setInfobipBaseUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Msg91 Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Msg91 Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Msg91 AuthKey</label>
                  <input
                    type="text"
                    value={msg91AuthKey}
                    onChange={(e) => setMsg91AuthKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Msg91 DLT ID</label>
                  <input
                    type="text"
                    value={msg91DltId}
                    onChange={(e) => setMsg91DltId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SMS Test Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-800 text-sm">
                After clicking &quot;Test SMS Server&quot;, a test message will be sent to your phone
              </p>
            </div>

            {/* Test SMS Button */}
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium">
              Test SMS Server
            </button>
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

export default EmailSMSSetup; 

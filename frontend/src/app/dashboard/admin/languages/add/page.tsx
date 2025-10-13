"use client";
import React, { useState } from 'react';
import { 
  Home, 
  Globe, 
  Plus, 
  Key,
  AlertCircle,
  Save,
  RefreshCw
} from 'lucide-react';

const LanguagesPage = () => {
  // Add New Language Form State
  const [languageName, setLanguageName] = useState('');
  const [languageISO, setLanguageISO] = useState('');
  const [languageDirection, setLanguageDirection] = useState('LTR');
  const [addingLanguage, setAddingLanguage] = useState(false);

  // Add New Language Key Form State
  const [keyName, setKeyName] = useState('');
  const [addingKey, setAddingKey] = useState(false);

  const handleAddLanguage = async () => {
    if (!languageName.trim() || !languageISO.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setAddingLanguage(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAddingLanguage(false);
    
    // Reset form
    setLanguageName('');
    setLanguageISO('');
    setLanguageDirection('LTR');
    
    alert('Language added successfully!');
  };

  const handleAddKey = async () => {
    if (!keyName.trim()) {
      alert('Please enter a key name');
      return;
    }

    // Validate key name format
    const keyRegex = /^[a-z_]+$/;
    if (!keyRegex.test(keyName)) {
      alert('Key name should only contain lowercase letters and underscores, no spaces allowed');
      return;
    }

    setAddingKey(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAddingKey(false);
    
    // Reset form
    setKeyName('');
    
    alert('Language key added successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2">Add New Language & Key</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Home {'>'} Languages {'>'} <span className="text-red-500 dark:text-red-400 font-semibold">Add New Language & Key</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Add New Language */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Language</h2>
            </div>

            {/* Info Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  <strong>Note:</strong> This may take up to 5 minutes.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Language Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language Name
                </label>
                <input
                  type="text"
                  value={languageName}
                  onChange={(e) => setLanguageName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder=""
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use only english letters, no spaces allowed. E.g: russian</p>
              </div>

              {/* Language ISO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language ISO
                </label>
                <input
                  type="text"
                  value={languageISO}
                  onChange={(e) => setLanguageISO(e.target.value.toLowerCase())}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder=""
                />
              </div>

              {/* Direction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Direction
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  The direction of the language 'Left To Right' or 'Right To Left'
                </p>
                <select
                  value={languageDirection}
                  onChange={(e) => setLanguageDirection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="LTR">LTR</option>
                  <option value="RTL">RTL</option>
                </select>
              </div>

              {/* Add Language Button */}
              <button
                onClick={handleAddLanguage}
                disabled={addingLanguage || !languageName.trim() || !languageISO.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {addingLanguage ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Adding Language...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Language
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Add New Language Key */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Language Key</h2>
            </div>

            <div className="space-y-6">
              {/* Key Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value.toLowerCase().replace(/[^a-z_]/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder=""
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use only english letters, no spaces allowed, example: this_is_a_key
                </p>
              </div>

              {/* Add Key Button */}
              <button
                onClick={handleAddKey}
                disabled={addingKey || !keyName.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {addingKey ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Adding Key...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Key
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Language Management Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Adding Languages</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Use standard language names (e.g., english, spanish, french)</li>
                <li>• ISO codes should follow ISO 639-1 standard (e.g., en, es, fr)</li>
                <li>• Choose correct text direction for the language</li>
                <li>• Language addition may take up to 5 minutes to complete</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Adding Language Keys</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Keys are used for translation variables</li>
                <li>• Use descriptive names (e.g., welcome_message, login_button)</li>
                <li>• Only lowercase letters and underscores allowed</li>
                <li>• Keys will be available across all languages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagesPage;

"use client";

import React, { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Code, Eye, EyeOff } from 'lucide-react';
import { useGroupTheme } from '@/contexts/GroupThemeContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface GroupThemeEditorProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

const GroupThemeEditor: React.FC<GroupThemeEditorProps> = ({ groupId, isOpen, onClose }) => {
  const { currentGroupTheme, loading, updateGroupTheme, loadGroupTheme, resetTheme } = useGroupTheme();
  const { isDarkMode } = useDarkMode();
  
  const [theme, setTheme] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    accentColor: '#F59E0B',
    customCSS: '',
    customJS: ''
  });

  const [activeTab, setActiveTab] = useState<'colors' | 'css' | 'js'>('colors');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && groupId) {
      loadGroupTheme(groupId);
    }
  }, [isOpen, groupId, loadGroupTheme]);

  useEffect(() => {
    if (currentGroupTheme) {
      setTheme(currentGroupTheme);
    }
  }, [currentGroupTheme]);

  const handleColorChange = (colorType: string, value: string) => {
    const newTheme = { ...theme, [colorType]: value };
    setTheme(newTheme);
    
    if (showPreview) {
      // Apply preview immediately
      const root = document.documentElement;
      root.style.setProperty(`--group-${colorType.replace('Color', '-color')}`, value);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateGroupTheme(groupId, theme);
      onClose();
    } catch (error) {
      console.error('Failed to save theme:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultTheme = {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#F59E0B',
      customCSS: '',
      customJS: ''
    };
    setTheme(defaultTheme);
    resetTheme();
  };

  const togglePreview = () => {
    if (showPreview) {
      resetTheme();
    } else {
      // Apply current theme for preview
      const root = document.documentElement;
      root.style.setProperty('--group-primary-color', theme.primaryColor);
      root.style.setProperty('--group-secondary-color', theme.secondaryColor);
      root.style.setProperty('--group-background-color', theme.backgroundColor);
      root.style.setProperty('--group-text-color', theme.textColor);
      root.style.setProperty('--group-accent-color', theme.accentColor);
    }
    setShowPreview(!showPreview);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className={`w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Group Theme Editor
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePreview}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showPreview 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`w-64 border-r border-gray-200 dark:border-gray-700 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('colors')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'colors'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Colors
                </button>
                <button
                  onClick={() => setActiveTab('css')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'css'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  Custom CSS
                </button>
                <button
                  onClick={() => setActiveTab('js')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'js'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  Custom JS
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Color Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={theme.primaryColor}
                            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                          />
                          <input
                            type="text"
                            value={theme.primaryColor}
                            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={theme.secondaryColor}
                            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                          />
                          <input
                            type="text"
                            value={theme.secondaryColor}
                            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Background Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={theme.backgroundColor}
                            onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                          />
                          <input
                            type="text"
                            value={theme.backgroundColor}
                            onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Text Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={theme.textColor}
                            onChange={(e) => handleColorChange('textColor', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                          />
                          <input
                            type="text"
                            value={theme.textColor}
                            onChange={(e) => handleColorChange('textColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Accent Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={theme.accentColor}
                            onChange={(e) => handleColorChange('accentColor', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                          />
                          <input
                            type="text"
                            value={theme.accentColor}
                            onChange={(e) => handleColorChange('accentColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'css' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Custom CSS
                  </h3>
                  <textarea
                    value={theme.customCSS}
                    onChange={(e) => setTheme({ ...theme, customCSS: e.target.value })}
                    placeholder="Enter your custom CSS here..."
                    className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
                  />
                </div>
              )}

              {activeTab === 'js' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Custom JavaScript
                  </h3>
                  <textarea
                    value={theme.customJS}
                    onChange={(e) => setTheme({ ...theme, customJS: e.target.value })}
                    placeholder="Enter your custom JavaScript here..."
                    className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t border-gray-200 dark:border-gray-700 ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Theme'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupThemeEditor;

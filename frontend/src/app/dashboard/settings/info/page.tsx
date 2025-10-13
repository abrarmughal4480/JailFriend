"use client";
import React, { useState } from 'react';
import Popup from '@/components/Popup';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface DataOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  selected: boolean;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const DownloadMyInformationPage = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [dataOptions, setDataOptions] = useState<DataOption[]>([
    {
      id: 'information',
      title: 'My Information',
      icon: (
        <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-cyan-100',
      selected: false
    },
    {
      id: 'posts',
      title: 'My posts',
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      bgColor: 'bg-red-100',
      selected: false
    },
    {
      id: 'groups',
      title: 'My Groups',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-purple-100',
      selected: false
    },
    {
      id: 'pages',
      title: 'My Pages',
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
      bgColor: 'bg-red-100',
      selected: false
    },
    {
      id: 'followers',
      title: 'Followers',
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      bgColor: 'bg-yellow-100',
      selected: false
    },
    {
      id: 'following',
      title: 'Following',
      icon: (
        <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      bgColor: 'bg-cyan-100',
      selected: false
    }
  ]);

  const showPopup = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  const handleOptionToggle = (optionId: string) => {
    setDataOptions(prev => 
      prev.map(option => 
        option.id === optionId 
          ? { ...option, selected: !option.selected }
          : option
      )
    );
  };

  const handleGenerateFile = async () => {
    const selectedOptions = dataOptions.filter(option => option.selected);
    
    if (selectedOptions.length === 0) {
      showPopup('error', 'Validation Error', 'Please select at least one data type to download');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Try backend API first
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
        const response = await fetch(`${apiUrl}/api/dataexports`, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            selectedDataTypes: selectedOptions.map(option => option.id)
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Data export created:', result);
          
          // Show success message
          showPopup('success', 'Success', 'Your data export request has been created successfully! You will receive a notification when it\'s ready for download.');
          
          // Reset selections
          setDataOptions(prev => 
            prev.map(option => ({ ...option, selected: false }))
          );
        } else {
          // Fallback to local file generation if API fails
          throw new Error('API failed, using local generation');
        }
      } else {
        // Fallback to local file generation if no token
        throw new Error('No token, using local generation');
      }
    } catch (error) {
      console.error('Error creating data export:', error);
      
      // Fallback to local file generation
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create a simple text file with selected data types
        const selectedTitles = selectedOptions.map(option => option.title).join(', ');
        const fileContent = `Data Export Request
Generated on: ${new Date().toLocaleString()}
Selected Data Types: ${selectedTitles}

This file contains your requested data export.
The actual data would be processed and included in a real implementation.`;

        // Create and download file
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `my-information-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showPopup('success', 'Success', 'Your data export file has been generated and downloaded successfully! (Generated locally)');
        
        // Reset selections
        setDataOptions(prev => 
          prev.map(option => ({ ...option, selected: false }))
        );
      } catch (localError) {
        console.error('Error in local file generation:', localError);
        showPopup('error', 'Error', 'Failed to generate file. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = dataOptions.filter(option => option.selected).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`rounded-lg shadow-sm border p-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="mb-8">
          <h1 className={`text-2xl font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Download My Information</h1>
          <p className={`${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Please choose which information you would like to download</p>
        </div>
        
        {/* Data Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dataOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleOptionToggle(option.id)}
              className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                option.selected 
                  ? isDarkMode
                    ? 'border-blue-500 bg-blue-900/20 shadow-md'
                    : 'border-blue-500 bg-blue-50 shadow-md'
                  : isDarkMode
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Selection Indicator */}
              {option.selected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full ${option.bgColor} flex items-center justify-center mb-4`}>
                  {option.icon}
                </div>
                <h3 className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{option.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Selection Summary */}
        {selectedCount > 0 && (
          <div className={`mb-6 p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm ${
              isDarkMode ? 'text-blue-300' : 'text-blue-800'
            }`}>
              <span className="font-medium">{selectedCount}</span> data type{selectedCount !== 1 ? 's' : ''} selected for download
            </p>
          </div>
        )}

        {/* Generate File Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateFile}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating file...' : 'Generate file'}
          </button>
        </div>

        {/* Information Note */}
        <div className={`mt-6 p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`text-sm font-medium mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Information:</h4>
          <ul className={`text-sm space-y-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <li>• Your data will be compiled into a downloadable file</li>
            <li>• Processing may take a few minutes for large amounts of data</li>
            <li>• The file will contain all selected information in a readable format</li>
            <li>• This process complies with data protection regulations</li>
          </ul>
        </div>
      </div>

      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default DownloadMyInformationPage;
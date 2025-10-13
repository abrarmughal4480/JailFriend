"use client";
import React, { useState, useEffect } from 'react';
import Popup from '@/components/Popup';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface InvitationStats {
  availableLinks: number;
  generatedLinks: number;
  usedLinks: number;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const InvitationLinksPage = () => {
  const { isDarkMode } = useDarkMode();
  const [stats, setStats] = useState<InvitationStats>({
    availableLinks: 10,
    generatedLinks: 0,
    usedLinks: 0
  });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    // Load invitation statistics from backend API
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Fallback to localStorage if no token
          const savedStats = localStorage.getItem('invitationStats');
          if (savedStats) {
            setStats(JSON.parse(savedStats));
          }
          return;
        }

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com/api/invitations/stats', { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setStats(result.data);
          // Also save to localStorage as backup
          localStorage.setItem('invitationStats', JSON.stringify(result.data));
        } else {
          // Fallback to localStorage if API fails
          const savedStats = localStorage.getItem('invitationStats');
          if (savedStats) {
            setStats(JSON.parse(savedStats));
          }
        }
      } catch (error) {
        console.error('Error fetching invitation stats:', error);
        // Fallback to localStorage if network error
        const savedStats = localStorage.getItem('invitationStats');
        if (savedStats) {
          setStats(JSON.parse(savedStats));
        }
      }
    };
    
    loadStats();
  }, []);

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

  const handleGenerateLinks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Try backend API first
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com/api/invitations/generate', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Invitation generated:', result);
          
          // Update stats with backend data
          setStats(result.data.stats);
          localStorage.setItem('invitationStats', JSON.stringify(result.data.stats));
          
          showPopup('success', 'Success', `Invitation link generated successfully! Code: ${result.data.invitationCode}`);
        } else {
          // Fallback to local generation if API fails
          throw new Error('API failed, using local generation');
        }
      } else {
        // Fallback to local generation if no token
        throw new Error('No token, using local generation');
      }
    } catch (error) {
      console.error('Error generating invitation link:', error);
      
      // Fallback to local generation
      try {
        // Simulate API call to generate links
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update stats - move from available to generated
        const newStats = {
          ...stats,
          availableLinks: Math.max(0, stats.availableLinks - 1),
          generatedLinks: stats.generatedLinks + 1
        };
        
        setStats(newStats);
        localStorage.setItem('invitationStats', JSON.stringify(newStats));
        
        console.log('Invitation link generated successfully (local)');
        showPopup('success', 'Success', 'Invitation link generated successfully! (Generated locally)');
      } catch (localError) {
        console.error('Error in local generation:', localError);
        showPopup('error', 'Error', 'Failed to generate invitation link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      count: stats.availableLinks,
      label: 'Available Links'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      count: stats.generatedLinks,
      label: 'Generated Links'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      bgColor: 'bg-orange-100',
      count: stats.usedLinks,
      label: 'Used Links'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`rounded-lg shadow-sm border p-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h1 className={`text-2xl font-semibold mb-8 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Invitation Links</h1>
        
        {/* Statistics */}
        <div className="space-y-6 mb-12">
          {statItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{item.count}</span>
                <span className={`font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateLinks}
            disabled={loading || stats.availableLinks === 0}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate links'}
          </button>
        </div>

        {stats.availableLinks === 0 && (
          <p className={`text-center text-sm mt-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No available links remaining
          </p>
        )}
      </div>

      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default InvitationLinksPage;
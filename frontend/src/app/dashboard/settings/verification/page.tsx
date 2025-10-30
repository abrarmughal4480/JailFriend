"use client";
import React, { useState, useRef, useEffect } from 'react';
import Popup from '@/components/Popup';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';

interface VerificationData {
  username: string;
  message: string;
  passportDocument: File | null;
  personalPicture: File | null;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const ProfileVerificationPage = () => {
  // Ensure system dark mode has no effect - especially for mobile systems
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<{
    status: 'none' | 'pending' | 'approved' | 'rejected';
    verification: any;
  } | null>(null);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [verificationData, setVerificationData] = useState<VerificationData>({
    username: '',
    message: '',
    passportDocument: null,
    personalPicture: null
  });

  const passportInputRef = useRef<HTMLInputElement>(null);
  const pictureInputRef = useRef<HTMLInputElement>(null);

  // Load verification status on component mount
  useEffect(() => {
    const loadVerificationStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setStatusLoading(false);
          return;
        }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/verification/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Verification status loaded:', data);
          setVerificationStatus(data);
        } else {
          console.error('Failed to load verification status');
        }
      } catch (error) {
        console.error('Error loading verification status:', error);
      } finally {
        setStatusLoading(false);
      }
    };

    loadVerificationStatus();
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

  const handleInputChange = (field: 'username' | 'message', value: string) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePassportUpload = () => {
    passportInputRef.current?.click();
  };

  const handlePictureUpload = () => {
    pictureInputRef.current?.click();
  };

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showPopup('error', 'File Too Large', 'Document file must be less than 10MB');
        return;
      }
      setVerificationData(prev => ({
        ...prev,
        passportDocument: file
      }));
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showPopup('error', 'File Too Large', 'Picture file must be less than 5MB');
        return;
      }
      setVerificationData(prev => ({
        ...prev,
        personalPicture: file
      }));
    }
  };

  const handleSend = async () => {
    // Basic validation
    if (!verificationData.username.trim()) {
      showPopup('error', 'Validation Error', 'Please enter your username');
      return;
    }

    if (!verificationData.passportDocument) {
      showPopup('error', 'Validation Error', 'Please upload a copy of your passport or ID card');
      return;
    }

    if (!verificationData.personalPicture) {
      showPopup('error', 'Validation Error', 'Please upload your personal picture');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in to submit verification request.');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('username', verificationData.username.trim());
      formData.append('message', verificationData.message.trim());
      formData.append('passportDocument', verificationData.passportDocument);
      formData.append('personalPicture', verificationData.personalPicture);

      console.log('Submitting verification request...');
      console.log('Username:', verificationData.username);
      console.log('Message:', verificationData.message);
      console.log('Passport file:', verificationData.passportDocument?.name);
      console.log('Picture file:', verificationData.personalPicture?.name);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Verification request submitted successfully:', data);
        
        showPopup('success', 'Success', 'Verification request sent successfully! We will review your submission and get back to you within 2-3 business days.');
        
        // Reset form
        setVerificationData({
          username: '',
          message: '',
          passportDocument: null,
          personalPicture: null
        });
        
        // Clear file inputs
        if (passportInputRef.current) passportInputRef.current.value = '';
        if (pictureInputRef.current) pictureInputRef.current.value = '';
        
        // Dispatch event to refresh profile
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to submit verification:', errorData);
        showPopup('error', 'Submission Failed', errorData.message || errorData.error || 'Failed to submit verification request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending verification request:', error);
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`rounded-lg shadow-sm border p-8 transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h1 className={`text-2xl font-semibold mb-8 transition-colors duration-200 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Verification of the profile!</h1>
        
        {/* Verification Status */}
        {statusLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className={`transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Loading verification status...</p>
          </div>
        ) : verificationStatus && verificationStatus.status !== 'none' ? (
          <div className={`mb-8 p-6 rounded-lg transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Verification Status</h3>
            
            {verificationStatus.status === 'pending' && (
              <div className="flex items-center gap-3 text-orange-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                <span className="font-medium">Pending Review</span>
              </div>
            )}
            
            {verificationStatus.status === 'approved' && (
              <div className="flex items-center gap-3 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Approved ✓</span>
              </div>
            )}
            
            {verificationStatus.status === 'rejected' && (
              <div className="flex items-center gap-3 text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">Rejected</span>
              </div>
            )}
            
            {verificationStatus.verification && (
              <div className={`mt-4 text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <p><strong>Submitted:</strong> {new Date(verificationStatus.verification.createdAt).toLocaleDateString()}</p>
                {verificationStatus.verification.adminNotes && (
                  <p className="mt-2"><strong>Notes:</strong> {verificationStatus.verification.adminNotes}</p>
                )}
              </div>
            )}
          </div>
        ) : null}
        
        <div className="space-y-6">
          {/* Show message if already verified or pending */}
          {verificationStatus?.status === 'approved' && (
            <div className={`p-4 border rounded-lg transition-colors duration-200 ${
              isDarkMode 
                ? 'bg-green-900/20 border-green-800' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Your profile is already verified!</span>
              </div>
            </div>
          )}
          
          {verificationStatus?.status === 'pending' && (
            <div className={`p-4 border rounded-lg transition-colors duration-200 ${
              isDarkMode 
                ? 'bg-orange-900/20 border-orange-800' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 dark:border-orange-400"></div>
                <span className="font-medium">Your verification request is pending review.</span>
              </div>
            </div>
          )}
          
          {/* Form - only show if not approved and not pending */}
          {verificationStatus?.status !== 'approved' && verificationStatus?.status !== 'pending' && (
            <>
              {/* Username */}
              <div>
                <input
                  type="text"
                  value={verificationData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Username"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 text-white placeholder-gray-400 bg-gray-700' 
                      : 'border-gray-300 text-gray-900 placeholder-gray-500 bg-white'
                  }`}
                />
              </div>

              {/* Message */}
              <div>
                <textarea
                  value={verificationData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Message"
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 text-white placeholder-gray-400 bg-gray-700' 
                      : 'border-gray-300 text-gray-900 placeholder-gray-500 bg-white'
                  }`}
                />
              </div>

              {/* Upload Documents Section */}
              <div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Upload documents</h3>
                <p className={`text-sm mb-4 transition-colors duration-200 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Please upload a photo with your passport / ID & your distinct photo
                </p>

                <div className="space-y-4">
                  {/* Passport/ID Upload */}
                  <div
                    onClick={handlePassportUpload}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-colors duration-200 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {verificationData.passportDocument 
                          ? verificationData.passportDocument.name 
                          : 'Copy of your passport or ID card'
                        }
                      </p>
                      {verificationData.passportDocument && (
                        <p className={`text-sm transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {(verificationData.passportDocument.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    {verificationData.passportDocument && (
                      <div className="text-green-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Personal Picture Upload */}
                  <div
                    onClick={handlePictureUpload}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-colors duration-200 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {verificationData.personalPicture 
                          ? verificationData.personalPicture.name 
                          : 'Your personal picture'
                        }
                      </p>
                      {verificationData.personalPicture && (
                        <p className={`text-sm transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {(verificationData.personalPicture.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    {verificationData.personalPicture && (
                      <div className="text-green-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Verification Request'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={passportInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handlePassportChange}
          className="hidden"
        />
        <input
          ref={pictureInputRef}
          type="file"
          accept="image/*"
          onChange={handlePictureChange}
          className="hidden"
        />

        {/* Guidelines */}
        <div className={`p-4 border rounded-lg mt-6 transition-colors duration-200 ${
          isDarkMode 
            ? 'bg-yellow-900/20 border-yellow-800' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h4 className={`text-sm font-medium mb-2 transition-colors duration-200 ${
            isDarkMode ? 'text-yellow-200' : 'text-yellow-900'
          }`}>Verification Guidelines:</h4>
          <ul className={`text-sm space-y-1 transition-colors duration-200 ${
            isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
          }`}>
            <li>• Upload clear, high-quality photos</li>
            <li>• Ensure all text in documents is readable</li>
            <li>• Personal picture should clearly show your face</li>
            <li>• Documents: max 10MB, Pictures: max 5MB</li>
            <li>• Supported formats: JPG, PNG, PDF (for documents)</li>
          </ul>
        </div>
      </div>

      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default ProfileVerificationPage;

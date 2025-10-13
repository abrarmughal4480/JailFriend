"use client";
import React, { useState, useRef, useEffect } from 'react';
import Popup from '@/components/Popup';

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Verification of the profile!</h1>
        
        {/* Verification Status */}
        {statusLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading verification status...</p>
          </div>
        ) : verificationStatus && verificationStatus.status !== 'none' ? (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification Status</h3>
            
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
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
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
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Your profile is already verified!</span>
              </div>
            </div>
          )}
          
          {verificationStatus?.status === 'pending' && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                />
              </div>

              {/* Message */}
              <div>
                <textarea
                  value={verificationData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 resize-vertical"
                />
              </div>

              {/* Upload Documents Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload documents</h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm mb-4">
                  Please upload a photo with your passport / ID & your distinct photo
                </p>

                <div className="space-y-4">
                  {/* Passport/ID Upload */}
                  <div
                    onClick={handlePassportUpload}
                    className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {verificationData.passportDocument 
                          ? verificationData.passportDocument.name 
                          : 'Copy of your passport or ID card'
                        }
                      </p>
                      {verificationData.passportDocument && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {verificationData.personalPicture 
                          ? verificationData.personalPicture.name 
                          : 'Your personal picture'
                        }
                      </p>
                      {verificationData.personalPicture && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-500 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
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
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mt-6">
          <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-2">Verification Guidelines:</h4>
          <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
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

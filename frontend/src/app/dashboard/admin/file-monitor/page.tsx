"use client";
import React, { useState, useEffect } from 'react';
import { Activity, Play, Square, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Popup, { PopupState } from '../../../../components/Popup';

interface FileMonitorStatus {
  isWatching: boolean;
  uploadsPath: string;
  uploadsExists: boolean;
}

const FileMonitorPage: React.FC = () => {
  const [status, setStatus] = useState<FileMonitorStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
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

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/filemonitor/status`);
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
      } else {
        showPopup('error', 'Error', 'Failed to fetch file monitor status');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const startMonitoring = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/filemonitor/start`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        showPopup('success', 'Started!', 'File monitoring has been started successfully');
        setStatus(data.status);
      } else {
        showPopup('error', 'Error', data.message || 'Failed to start file monitoring');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/filemonitor/stop`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        showPopup('success', 'Stopped!', 'File monitoring has been stopped successfully');
        setStatus(data.status);
      } else {
        showPopup('error', 'Error', data.message || 'Failed to stop file monitoring');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/filemonitor/cleanup`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        showPopup('success', 'Cleanup Complete!', 'Manual cleanup has been completed successfully');
        setStatus(data.status);
      } else {
        showPopup('error', 'Error', data.message || 'Failed to run cleanup');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide pb-24 sm:pb-6 bg-gray-50 dark:bg-gray-900">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">File Monitor Admin</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">File Monitor Status</h2>
          </div>
          
          {status ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                {status.isWatching ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Inactive</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploads Directory:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{status.uploadsPath}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Directory Exists:</span>
                {status.uploadsExists ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Yes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">No</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading status...</p>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Controls</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={startMonitoring}
              disabled={loading || (status?.isWatching ?? false)}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Monitoring
            </button>
            
            <button
              onClick={stopMonitoring}
              disabled={loading || !(status?.isWatching ?? false)}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop Monitoring
            </button>
            
            <button
              onClick={runCleanup}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Run Cleanup
            </button>
          </div>
        </div>

        {/* Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">How File Monitor Works</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Automatically watches the uploads folder for file deletions</li>
                <li>• When a file is deleted, it removes references from posts and albums</li>
                <li>• If a post/album becomes empty after file deletion, it's automatically deleted</li>
                <li>• Manual cleanup scans for orphaned database entries</li>
                <li>• Only affects files in the uploads folder, external URLs are preserved</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileMonitorPage; 

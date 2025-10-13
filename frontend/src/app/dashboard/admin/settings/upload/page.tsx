"use client";
import React, { useState } from 'react';
import { Upload, Image, File, Video, Music } from 'lucide-react';

const UploadSettings = () => {
  // File Upload Settings
  const [maxFileSize, setMaxFileSize] = useState('10');
  const [allowedFileTypes, setAllowedFileTypes] = useState(['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf', 'doc']);
  const [enableImageCompression, setEnableImageCompression] = useState(true);
  const [imageQuality, setImageQuality] = useState('80');
  
  // Storage Settings
  const [storageProvider, setStorageProvider] = useState('Local');
  const [enableCDN, setEnableCDN] = useState(false);
  const [cdnUrl, setCdnUrl] = useState('');
  
  // Cloud Storage
  const [awsAccessKey, setAwsAccessKey] = useState('');
  const [awsSecretKey, setAwsSecretKey] = useState('');
  const [awsBucket, setAwsBucket] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Settings</h1>
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <span className="text-red-500">🏠</span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span className="text-red-500">Upload Settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Upload className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">File Upload Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                <input
                type="number"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum file size allowed for uploads.</p>
              </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
              <div className="grid grid-cols-2 gap-2">
                {['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf', 'doc', 'txt', 'zip'].map((type) => (
                  <label key={type} className="flex items-center">
                <input
                      type="checkbox"
                      checked={allowedFileTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllowedFileTypes([...allowedFileTypes, type]);
                        } else {
                          setAllowedFileTypes(allowedFileTypes.filter(t => t !== type));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{type.toUpperCase()}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Select which file types are allowed for upload.</p>
              </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Image Compression</label>
                <p className="text-xs text-gray-500">Automatically compress uploaded images.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableImageCompression}
                  onChange={(e) => setEnableImageCompression(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Quality (%)</label>
                <input
                type="range"
                min="10"
                max="100"
                value={imageQuality}
                onChange={(e) => setImageQuality(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>{imageQuality}%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Quality of compressed images.</p>
            </div>
          </div>
        </div>

        {/* Storage Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <File className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Storage Settings</h2>
              </div>

          <div className="space-y-6">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Storage Provider</label>
                <select
                value={storageProvider}
                onChange={(e) => setStorageProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                <option value="Local">Local Storage</option>
                <option value="AWS">Amazon S3</option>
                <option value="Cloudinary">Cloudinary</option>
                <option value="Google">Google Cloud Storage</option>
                </select>
              <p className="text-xs text-gray-500 mt-1">Choose where to store uploaded files.</p>
              </div>

            <div className="flex items-center justify-between">
          <div>
                <label className="text-sm font-medium text-gray-700">Enable CDN</label>
                <p className="text-xs text-gray-500">Use CDN for faster file delivery.</p>
            </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCDN}
                  onChange={(e) => setEnableCDN(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              </div>

            {enableCDN && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CDN URL</label>
                <input
                  type="url"
                  value={cdnUrl}
                  onChange={(e) => setCdnUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://cdn.yourdomain.com"
                />
                <p className="text-xs text-gray-500 mt-1">CDN endpoint for serving files.</p>
              </div>
            )}
            </div>
          </div>
        </div>

      {/* AWS S3 Configuration */}
      {storageProvider === 'AWS' && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">AWS S3 Configuration</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AWS Access Key</label>
                <input
                  type="text"
                  value={awsAccessKey}
                  onChange={(e) => setAwsAccessKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter AWS Access Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AWS Secret Key</label>
                <input
                  type="password"
                  value={awsSecretKey}
                  onChange={(e) => setAwsSecretKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter AWS Secret Key"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">S3 Bucket Name</label>
                <input
                  type="text"
                  value={awsBucket}
                  onChange={(e) => setAwsBucket(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter S3 Bucket Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AWS Region</label>
                <select
                  value={awsRegion}
                  onChange={(e) => setAwsRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </select>
              </div>
              </div>
            </div>
          </div>
      )}

      {/* Save Settings Button */}
      <div className="mt-6 flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default UploadSettings; 

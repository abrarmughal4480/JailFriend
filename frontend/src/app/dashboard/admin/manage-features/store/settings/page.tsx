'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { websiteSettingsApi } from '@/utils/websiteSettingsApi';

const StoreSettings = () => {
  const { isDarkMode } = useDarkMode();
  const [storeSystem, setStoreSystem] = useState<boolean>(true);
  const [reviewProducts, setReviewProducts] = useState<boolean>(false);
  const [salesCommission, setSalesCommission] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settings = await websiteSettingsApi.getSettings();
      
      // Get store settings from the settings object
      // Assuming these are stored in features or general settings
      const storeSystemEnabled = (settings as any).features?.storeSystem ?? true;
      const reviewProductsEnabled = (settings as any).features?.reviewProducts ?? false;
      const commissionValue = (settings as any).general?.salesCommission ?? '0';
      
      setStoreSystem(storeSystemEnabled);
      setReviewProducts(reviewProductsEnabled);
      setSalesCommission(commissionValue.toString());
    } catch (error) {
      console.error('Error fetching store settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStoreSystem = async () => {
    try {
      setUpdating('storeSystem');
      const newValue = !storeSystem;
      await websiteSettingsApi.updateFeature('storeSystem', newValue);
      setStoreSystem(newValue);
      alert('Store System updated successfully!');
    } catch (error) {
      console.error('Error updating store system:', error);
      alert('Failed to update store system. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleReviewProducts = async () => {
    try {
      setUpdating('reviewProducts');
      const newValue = !reviewProducts;
      await websiteSettingsApi.updateFeature('reviewProducts', newValue);
      setReviewProducts(newValue);
      alert('Review Products updated successfully!');
    } catch (error) {
      console.error('Error updating review products:', error);
      alert('Failed to update review products. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleSalesCommissionChange = async (value: string) => {
    try {
      setUpdating('salesCommission');
      await websiteSettingsApi.updateGeneralSetting('salesCommission', value);
      setSalesCommission(value);
      alert('Sales Commission updated successfully!');
    } catch (error) {
      console.error('Error updating sales commission:', error);
      alert('Failed to update sales commission. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-4`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-4`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Home
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Manage Features
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Store
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-medium`}>Store Settings</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
          Store Settings
        </h1>

        {/* Settings Card */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
            Store Settings
          </h2>
          
          <div className="space-y-6">
            {/* Store System */}
            <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-6 last:border-b-0`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Store System
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Users will be able to sell and buy products.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={handleToggleStoreSystem}
                    disabled={updating === 'storeSystem'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      storeSystem
                        ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
                        : isDarkMode ? 'bg-red-600' : 'bg-red-500'
                    } ${updating === 'storeSystem' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        storeSystem ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                    {storeSystem ? (
                      <svg className="absolute left-1.5 h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="absolute right-1.5 h-3 w-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Review Products */}
            <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-6 last:border-b-0`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Review Products
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Review products by admin or moderators before publishing.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={handleToggleReviewProducts}
                    disabled={updating === 'reviewProducts'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      reviewProducts
                        ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
                        : isDarkMode ? 'bg-red-600' : 'bg-red-500'
                    } ${updating === 'reviewProducts' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reviewProducts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                    {reviewProducts ? (
                      <svg className="absolute left-1.5 h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="absolute right-1.5 h-3 w-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sales Commission */}
            <div className="pb-6">
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                  Sales Commission
                </h3>
                <input
                  type="text"
                  value={salesCommission}
                  onChange={(e) => setSalesCommission(e.target.value)}
                  onBlur={(e) => handleSalesCommissionChange(e.target.value)}
                  disabled={updating === 'salesCommission'}
                  className={`mt-2 w-full px-3 py-2 text-sm border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="0"
                />
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  How much you want to earn from each sale? (%), leave 0 if you don't want any.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;


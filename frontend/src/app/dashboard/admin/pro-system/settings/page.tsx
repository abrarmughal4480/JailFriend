"use client";

import React, { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import Link from 'next/link';
import { Star, Flame, Zap, Send, Edit, Trash } from 'lucide-react';
import EditPackageModal from './EditPackageModal';
import axios from 'axios';

interface ProPackage {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  color: string;
  status: 'enabled' | 'disabled';
  featured: boolean;
  seeProfileVisitors: boolean;
  showLastSeen: boolean;
  verifiedBadge: boolean;
  pagesPromotion: number;
  postsPromotion: number;
  maxUploadSize: string;
  discount: number;
  duration: number;
  durationUnit: 'Day' | 'Week' | 'Month' | 'Year';
  icon?: string;
  nightIcon?: string;
  description: string;
}

const ProSystemSettingsPage = () => {
  const { isDarkMode } = useDarkMode();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Toggle states
  const [proSystem, setProSystem] = useState(true);
  const [recurringPayment, setRecurringPayment] = useState(true);
  const [refundSystem, setRefundSystem] = useState(true);
  const [proMembershipOnSignUp, setProMembershipOnSignUp] = useState(true);

  // Packages data
  const [packages, setPackages] = useState<ProPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<ProPackage | null>(null);
  const [isNewPackage, setIsNewPackage] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    fetchSettings();
    fetchPackages();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/pro-system/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { enabled, recurringPayment, refundSystem, proMembershipOnSignUp } = res.data;
      setProSystem(enabled);
      setRecurringPayment(recurringPayment);
      setRefundSystem(refundSystem);
      setProMembershipOnSignUp(proMembershipOnSignUp);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/pro-system/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPackages(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/pro-system/settings`, newSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state implicitly or re-fetch?
      // Optimistic update done in handlers
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";
  const tableHeader = isDarkMode
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";

  const ToggleSwitch = ({
    enabled,
    onToggle
  }: {
    enabled: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enabled
        ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
        : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
      {enabled && (
        <svg className="absolute left-1.5 h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );

  const handleToggleProSystem = () => {
    const newVal = !proSystem;
    setProSystem(newVal);
    saveSettings({ enabled: newVal, recurringPayment, refundSystem, proMembershipOnSignUp });
  };

  const handleToggleRecurringPayment = () => {
    const newVal = !recurringPayment;
    setRecurringPayment(newVal);
    saveSettings({ enabled: proSystem, recurringPayment: newVal, refundSystem, proMembershipOnSignUp });
  };

  const handleToggleRefundSystem = () => {
    const newVal = !refundSystem;
    setRefundSystem(newVal);
    saveSettings({ enabled: proSystem, recurringPayment, refundSystem: newVal, proMembershipOnSignUp });
  };

  const handleToggleProMembershipOnSignUp = () => {
    const newVal = !proMembershipOnSignUp;
    setProMembershipOnSignUp(newVal);
    saveSettings({ enabled: proSystem, recurringPayment, refundSystem, proMembershipOnSignUp: newVal });
  };

  const handleAddNewPackage = () => {
    setCurrentPackage(null);
    setIsNewPackage(true);
    setIsModalOpen(true);
  };

  const handleEditPackage = (pkg: ProPackage) => {
    setCurrentPackage(pkg);
    setIsNewPackage(false);
    setIsModalOpen(true);
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/pro-system/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package", error);
      alert("Failed to delete package");
    }
  }

  const handleSavePackage = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (isNewPackage) {
        await axios.post(`${API_URL}/admin/pro-system/packages`, formData, config);
      } else {
        // Current package must have an ID
        const id = currentPackage?._id || currentPackage?.id;
        if (id) {
          await axios.put(`${API_URL}/admin/pro-system/packages/${id}`, formData, config);
        }
      }
      fetchPackages();
    } catch (error) {
      console.error("Error saving package", error);
      alert("Failed to save package");
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
            Pro System Settings
          </h1>
          {/* Breadcrumb */}
          <div className={`text-sm ${textSecondary} flex items-center space-x-2`}>
            <Link href="/dashboard/admin" className="hover:underline">Home</Link>
            <span>&gt;</span>
            <Link href="/dashboard/admin/pro-system" className="hover:underline">Pro System</Link>
            <span>&gt;</span>
            <span className={isDarkMode ? 'text-red-400' : 'text-red-500'}>Pro System Settings</span>
          </div>
        </div>

        {/* Warning Banner */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
            <strong>Note:</strong> Some features are disabled due to the website mode you used.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Settings Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pro System Settings Panel */}
            <div className={`${cardBase} rounded-lg p-6`}>
              <h2 className={`text-lg font-semibold ${textPrimary} mb-6`}>
                Pro System Settings
              </h2>

              <div className="space-y-6">
                {/* Pro System Toggle */}
                <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-6 last:border-b-0`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${textPrimary} mb-1`}>
                        Pro System
                      </h3>
                      <p className={`text-xs ${textSecondary}`}>
                        If you disable Pro Mode, All features will be free and activated without the boost feature.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ToggleSwitch enabled={proSystem} onToggle={handleToggleProSystem} />
                    </div>
                  </div>
                </div>

                {/* Recurring Payment Toggle */}
                <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-6 last:border-b-0`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${textPrimary} mb-1`}>
                        Recurring Payment
                      </h3>
                      <p className={`text-xs ${textSecondary}`}>
                        Enable automatic payments (cronjob)
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ToggleSwitch enabled={recurringPayment} onToggle={handleToggleRecurringPayment} />
                    </div>
                  </div>
                </div>

                {/* Refund System Toggle */}
                <div className="pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${textPrimary} mb-1`}>
                        Refund System
                      </h3>
                      <p className={`text-xs ${textSecondary}`}>
                        Allow users to request refund.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ToggleSwitch enabled={refundSystem} onToggle={handleToggleRefundSystem} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Membership Features Panel */}
            <div className={`${cardBase} rounded-lg p-6`}>
              <h2 className={`text-lg font-semibold ${textPrimary} mb-6`}>
                Pro Membership Features
              </h2>

              <div className="space-y-6">
                {/* Pro Membership On Sign Up Toggle */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${textPrimary} mb-1`}>
                        Pro Membership On Sign Up
                      </h3>
                      <p className={`text-xs ${textSecondary}`}>
                        Require Pro Membership from users on sign up page.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ToggleSwitch enabled={proMembershipOnSignUp} onToggle={handleToggleProMembershipOnSignUp} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Pro Packages Panel */}
          <div className="lg:col-span-1">
            <div className={`${cardBase} rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${textPrimary}`}>
                  Edit Pro Packages
                </h2>
              </div>

              {/* Add New Package Button */}
              <button
                onClick={handleAddNewPackage}
                className={`w-full mb-6 px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                Add New Package
              </button>

              {/* Packages Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={tableHeader}>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>
                        NAME
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>
                        STATUS
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {isLoading ? (
                      <tr><td colSpan={3} className="px-4 py-4 text-center">Loading...</td></tr>
                    ) : packages.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-4 text-center">No packages found</td></tr>
                    ) : packages.map((pkg) => (
                      <tr key={pkg._id || pkg.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`px-4 py-3 whitespace-nowrap ${textPrimary}`}>
                          <div className="flex items-center space-x-2">
                            {/* Use icon or a generic fallback */}
                            {pkg.icon ? (
                              <img src={pkg.icon} className="w-4 h-4 object-contain" alt="" />
                            ) : (
                              <Star className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="font-medium" style={{ color: pkg.color }}>{pkg.name}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap ${textSecondary}`}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.status === 'enabled'
                            ? isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                            : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {pkg.status === 'enabled' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {pkg.status === 'enabled' ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap ${textSecondary}`}>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPackage(pkg)}
                              className={`px-2 py-1 rounded text-sm font-medium transition-colors ${isDarkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                              <div className="flex items-center">
                                <Edit className="w-3 h-3" />
                              </div>
                            </button>
                            <button
                              onClick={() => handleDeletePackage((pkg._id || pkg.id) as string)}
                              className={`px-2 py-1 rounded text-sm font-medium transition-colors ${isDarkMode
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                            >
                              <div className="flex items-center">
                                <Trash className="w-3 h-3" />
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      <EditPackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pkg={currentPackage}
        onSave={handleSavePackage}
        isNew={isNewPackage}
      />
    </div>
  );
};

export default ProSystemSettingsPage;



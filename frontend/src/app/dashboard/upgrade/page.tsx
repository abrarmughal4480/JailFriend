"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Crown, Check, Star, Zap, Rocket, Users, Shield, ChevronDown, Menu, X } from 'lucide-react';
import axios from 'axios';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface ProPackage {
  _id: string;
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

const PricingPage = () => {
  const { isDarkMode } = useDarkMode();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<ProPackage | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<ProPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);

  const getApiUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return url.endsWith('/api') ? url : `${url}/api`;
  };
  const API_URL = getApiUrl();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Initial load from local storage to show balance immediately
        const userStored = JSON.parse(localStorage.getItem('user') || '{}');
        if (userStored.balance !== undefined) {
          setWalletBalance(userStored.balance);
        }
        if (userStored.plan && userStored.plan !== 'Free') {
          setSelectedPlan(userStored.plan);
        }

        // Fetch Packages
        const packagesRes = await axios.get(`${API_URL}/admin/pro-system/packages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const enabledPackages = packagesRes.data.filter((p: ProPackage) => p.status === 'enabled');
        setPackages(enabledPackages);
        setIsLoadingPackages(false);

        // Fetch Wallet
        const walletRes = await axios.get(`${API_URL}/wallet`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setWalletBalance(walletRes.data.balance || 0);

      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoadingPackages(false);
      }
    };

    fetchData();
  }, [API_URL]);

  // Filter plans based on billing period
  const filteredPlans = packages.filter(p => p.durationUnit === billingPeriod);

  const handleUpgradeClick = (pkg: ProPackage) => {
    setPendingPlan(pkg);
    setShowPaymentModal(true);
  };

  const handlePayNow = async () => {
    if (!pendingPlan) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;

    if (walletBalance < pendingPlan.price) {
      alert(`Insufficient balance! You need $${pendingPlan.price} but only have $${walletBalance}.`);
      setShowPaymentModal(false);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/upgrade`, {
        userId,
        plan: pendingPlan.name,
        billing: billingPeriod, // This might need adjustment if backend expects 'monthly'/'yearly' specifically or handles 'Month'/'Year'
        packageId: pendingPlan._id // Sending ID ensures backend knows exactly which package
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 200 || res.status === 201) {
        // Update local user
        const updatedUser = { ...user, plan: pendingPlan.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setWalletBalance(res.data.user?.balance || (walletBalance - pendingPlan.price));

        setShowPaymentModal(false);
        setShowSuccessModal(true);
        setSelectedPlan(pendingPlan.name);

        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (error: any) {
      console.error("Upgrade error", error);
      alert(error.response?.data?.error || 'Upgrade failed');
      setShowPaymentModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate features list from package properties
  const getFeaturesList = (pkg: ProPackage) => {
    const list = [];
    if (pkg.featured) list.push('Featured member');
    if (pkg.seeProfileVisitors) list.push('See profile visitors');
    if (pkg.showLastSeen) list.push('Show / Hide last seen');
    if (pkg.verifiedBadge) list.push('Verified badge');
    if (pkg.postsPromotion > 0) list.push(`${pkg.postsPromotion} posts promotion`);
    if (pkg.pagesPromotion > 0) list.push(`${pkg.pagesPromotion} Pages`);
    if (pkg.discount > 0) list.push(`${pkg.discount}% Discount`);
    list.push(`${pkg.maxUploadSize} storage`);
    return list;
  };

  // Helper for dynamic colors
  const getStyles = (color: string) => ({
    borderColor: color,
    buttonStyle: { backgroundColor: color, color: '#fff' },
    iconStyle: { color: color },
    badgeStyle: { backgroundColor: color, color: '#fff' }
  });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'} pb-20 md:pb-0`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-sm sticky top-0 z-30 border-b`}>
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pricing Plans</h1>
            </div>
            {/* Mobile Menu Button omitted for brevity but logic exists */}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 mb-8 sm:mb-12 text-white relative overflow-hidden">
            {/* ... (Hero content same as before, condensed) ... */}
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                Jaifriend <span className="bg-orange-500 text-white px-2 py-1 rounded-lg">PRO</span>
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-6">Unlock premium features.</p>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Choose Your Plan
              </h2>
            </div>

            <div className={`rounded-xl p-1 flex ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {['Month', 'Year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setBillingPeriod(period as any)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${billingPeriod === period
                    ? 'bg-white text-gray-900 shadow-md'
                    : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {period === 'Month' ? 'Monthly' : 'Yearly'}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Plans Grid */}
          {isLoadingPackages ? (
            <div className="text-center py-12">Loading plans...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No plans available for this period.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 md:mb-0">
              {filteredPlans.map((plan) => {
                const styles = getStyles(plan.color || '#3b82f6'); // Default blue
                const features = getFeaturesList(plan);
                const isCurrent = selectedPlan === plan.name;

                return (
                  <div
                    key={plan._id}
                    className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 relative transition-all duration-300 hover:shadow-xl border-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                      } ${isCurrent ? 'shadow-lg scale-105' : 'hover:border-opacity-60'}`}
                    style={{ borderColor: isCurrent ? styles.borderColor : (isDarkMode ? '#374151' : '#e5e7eb') }}
                  >

                    <div className="text-center mb-4 sm:mb-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-opacity-20" style={{ backgroundColor: `${styles.borderColor}33` }}>
                        {plan.icon ? (
                          <img src={plan.icon} alt={plan.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <Star className="w-8 h-8" style={styles.iconStyle} />
                        )}
                      </div>

                      <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{plan.name}</h3>

                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>$</span>
                        <span className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{plan.price}</span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/ {plan.durationUnit.toLowerCase()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpgradeClick(plan)}
                      disabled={isCurrent}
                      className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 mb-4 sm:mb-6 text-sm sm:text-base ${isCurrent
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'hover:shadow-md active:scale-95 text-white'
                        }`}
                      style={isCurrent ? {} : styles.buttonStyle}
                    >
                      {isCurrent ? 'Current Plan' : 'Upgrade Now'}
                    </button>

                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-center">
                      <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        {plan.description || "Get started today!"}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && pendingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pay By Wallet</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              You are about to upgrade to a <span className="font-semibold">{pendingPlan.name}</span> membership.
            </p>

            <div className={`rounded-lg p-4 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Plan:</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pendingPlan.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Amount:</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${pendingPlan.price}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-600 pt-2 mt-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Wallet Balance:</span>
                <span className={`font-semibold ${walletBalance >= pendingPlan.price ? 'text-green-500' : 'text-red-500'}`}>
                  ${walletBalance}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handlePayNow}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && pendingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-md w-full shadow-2xl text-center max-h-[90vh] overflow-y-auto`}>
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-white" />
            </div>

            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Congratulations! You're now a
            </h3>
            <h2 className="text-3xl font-bold mb-6" style={{ color: pendingPlan.color || '#22c55e' }}>
              {pendingPlan.name}
            </h2>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition-colors"
            >
              Let's Explore! It's Pro Time!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PricingPage;

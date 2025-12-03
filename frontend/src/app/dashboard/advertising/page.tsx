"use client";
import React, { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const AdvertisingPage = () => {
  const { isDarkMode } = useDarkMode();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'createAd', 'sendMoney', 'withdrawal'
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState('media'); // 'media', 'details', 'targeting'
  const [adPreviewOpen, setAdPreviewOpen] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  // Wallet and campaigns state
  const [walletBalance, setWalletBalance] = useState(0);
  const [userCampaigns, setUserCampaigns] = useState<any[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [creatingAd, setCreatingAd] = useState(false);

  // Details step state
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [myPages, setMyPages] = useState('');
  const [userPages, setUserPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  // Targeting step state
  const [placement, setPlacement] = useState('Entire Site (File Format image)');
  const [bidding, setBidding] = useState('Pay Per Click ($0.075)');
  const [location, setLocation] = useState('');
  const [audience, setAudience] = useState<string[]>([]);
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const [campaignBudget, setCampaignBudget] = useState('');
  const [gender, setGender] = useState('All');

  const getBiddingOptions = (placementValue: string): string[] => {
    const isEntireSite = placementValue === 'Entire Site (File Format image)';
    if (isEntireSite) {
      return ['Pay Per Click ($0.075)', 'Pay Per Impression ($0.015)'];
    }
    return ['Pay Per Click ($0.05)', 'Pay Per Impression ($0.01)'];
  };

  // Analytics Modal State
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [openMenuAdId, setOpenMenuAdId] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    placement: 'Entire Site (File Format image)',
    bidding: 'Pay Per Click ($0.075)',
    location: '',
    gender: 'All',
    websiteUrl: ''
  });

  const openAnalytics = (campaign: any) => {
    setSelectedAd(campaign);
    setShowAnalyticsModal(true);
  };

  const openEditCampaign = (campaign: any) => {
    const placementValue = campaign.placement || 'Entire Site (File Format image)';
    setEditingAd(campaign);
    setEditForm({
      title: campaign.title || '',
      description: campaign.description || '',
      placement: placementValue,
      bidding: campaign.bidding || getBiddingOptions(placementValue)[0],
      location: campaign.location || '',
      gender: campaign.gender || 'All',
      websiteUrl: campaign.websiteUrl || ''
    });
    setOpenMenuAdId(null);
  };

  const calculateSpent = (ad: any): number => {
    if (!ad) return 0;
    const clicks = ad.clicks || 0;
    const views = ad.views || 0;
    const biddingStr = ad.bidding || '';
    const isPPC = biddingStr.includes('Pay Per Click');
    const isEntireSite = ad.placement === 'Entire Site (File Format image)';
    const ppcRate = isEntireSite ? 0.075 : 0.05;
    const ppiRate = isEntireSite ? 0.015 : 0.01;

    if (isPPC) {
      return +(clicks * ppcRate).toFixed(2);
    }
    return +(views * ppiRate).toFixed(2);
  };

  const interests = [
    { id: 'online-sales', label: 'Online Sales', icon: '📈' },
    { id: 'shopify-sales', label: 'Shopify Sales', icon: '🛒' },
    { id: 'brand-awareness', label: 'Brand Awareness', icon: '❤️' },
    { id: 'new-leads', label: 'New Leads', icon: '💬' },
    { id: 'app-installs', label: 'App Installs', icon: '📱' }
  ];

  const faqItems = [
    {
      question: "How do I run ads on Jaifriend",
      answer: "To run ads on Jaifriend, simply create an account, set up your campaign, choose your target audience, and launch your ad. Our platform makes it easy to reach Gen Z and Millennials effectively."
    },
    {
      question: "How do I create a Public Profile on Snapchat?",
      answer: "You can create a Public Profile through Snapchat's settings. Go to your profile, tap the settings gear, and look for 'Public Profile' options to get started."
    },
    {
      question: "What are the ad format options?",
      answer: "We offer various ad formats including fullscreen immersive ads, video ads, carousel ads, and story ads. Each format is designed to captivate and engage your target audience."
    }
  ];

  const countryOptions = [
    'United States',
    'Canada',
    'Afghanistan',
    'Albania',
    'Algeria',
    'American Samoa',
    'Argentina',
    'Australia',
    'Austria',
    'Bangladesh',
    'Belgium',
    'Brazil',
    'Bulgaria',
    'Cambodia',
    'Chile',
    'China',
    'Colombia',
    'Croatia',
    'Czech Republic',
    'Denmark',
    'Egypt',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hong Kong',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Ireland',
    'Israel',
    'Italy',
    'Japan',
    'Kenya',
    'Luxembourg',
    'Malaysia',
    'Mexico',
    'Netherlands',
    'New Zealand',
    'Nigeria',
    'Norway',
    'Pakistan',
    'Philippines',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'Saudi Arabia',
    'Singapore',
    'South Africa',
    'South Korea',
    'Spain',
    'Sri Lanka',
    'Sweden',
    'Switzerland',
    'Taiwan',
    'Thailand',
    'Turkey',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'Vietnam'
  ];

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const goToCreateAd = () => {
    setCurrentView('createAd');
  };

  const goToSendMoney = () => {
    setCurrentView('sendMoney');
  };

  const goToWithdrawal = () => {
    setCurrentView('withdrawal');
  };

  const goBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle advertisement publication
  const handlePublishAd = async () => {
    try {
      // Validate all required fields
      if (!companyName || !selectedImage || !campaignTitle || !campaignDescription || !startDate || !endDate || !campaignBudget) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate dates: start date cannot be earlier than today, end date cannot be earlier than start date
      if (startDate < todayStr) {
        alert('Start date cannot be earlier than today');
        return;
      }

      if (endDate < startDate) {
        alert('End date cannot be earlier than start date');
        return;
      }

      const budgetAmount = parseFloat(campaignBudget);
      if (isNaN(budgetAmount) || budgetAmount <= 0) {
        alert('Please enter a valid budget amount');
        return;
      }

      if (walletBalance < budgetAmount) {
        alert(`Insufficient wallet balance. You have $${walletBalance.toFixed(2)} but need $${budgetAmount.toFixed(2)}`);
        return;
      }

      setCreatingAd(true);

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to create advertisements');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('companyName', companyName);
      formData.append('title', campaignTitle);
      formData.append('description', campaignDescription);
      formData.append('image', selectedImage);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('budget', campaignBudget);
      formData.append('placement', placement);
      formData.append('bidding', bidding);
      formData.append('gender', gender);

      if (websiteUrl) formData.append('websiteUrl', websiteUrl);
      if (myPages) formData.append('pageId', myPages);
      if (location) formData.append('location', location);
      if (audience.length > 0) formData.append('audience', audience.join(', '));

      const response = await fetch(`${API_URL}/api/advertisements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert('Advertisement created successfully!');

        // Update wallet balance
        setWalletBalance(data.newBalance);

        // Refresh campaigns
        await fetchUserCampaigns();

        // Reset form and go back to dashboard
        setCompanyName('');
        setCampaignTitle('');
        setCampaignDescription('');
        setSelectedImage(null);
        setImagePreview(null);
        setStartDate('');
        setEndDate('');
        setWebsiteUrl('');
        setMyPages('');
        setCampaignBudget('');
        setLocation('');
        setCurrentStep('media');
        setCurrentView('dashboard');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create advertisement');
      }
    } catch (error) {
      console.error('Error creating advertisement:', error);
      alert('Failed to create advertisement. Please try again.');
    } finally {
      setCreatingAd(false);
    }
  };

  // Fetch user pages
  const fetchUserPages = async () => {
    try {
      setLoadingPages(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setUserPages([]);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/pages/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const pagesData = await response.json();
        setUserPages(pagesData || []);
      } else {
        console.error('Failed to fetch user pages');
        setUserPages([]);
      }
    } catch (error) {
      console.error('Error fetching user pages:', error);
      setUserPages([]);
    } finally {
      setLoadingPages(false);
    }
  };

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setLoadingWallet(false);
    }
  };

  // Fetch user's campaigns
  const fetchUserCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/advertisements/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserCampaigns(data || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Fetch user pages when component mounts or when entering details step
  useEffect(() => {
    if (currentView === 'createAd' && currentStep === 'details') {
      fetchUserPages();
    }
  }, [currentView, currentStep]);

  // Fetch wallet and campaigns on mount
  useEffect(() => {
    fetchWalletBalance();
    fetchUserCampaigns();
  }, []);

  // Dashboard View (Initial View)
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advertisement</h1>
          </div>
        </div>

        {/* Advertisement Dashboard */}
        <div className="bg-white dark:bg-gray-800 py-8 px-4">
          <div className="max-w-4xl mx-auto">

            {/* Tabs */}
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-8">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  Campaigns
                </button>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'wallet'
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  Wallet & Credits
                </button>
              </div>

              {/* Create New Button */}
              <button
                onClick={goToCreateAd}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Create New
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'campaigns' && (
              <div>
                {loadingCampaigns ? (
                  <div className="text-center py-16">
                    <p className="text-gray-600 dark:text-gray-400">Loading campaigns...</p>
                  </div>
                ) : userCampaigns.length > 0 ? (
                  <div className="space-y-4">




                    {userCampaigns.map((campaign) => (
                      <div
                        key={campaign._id}
                        onClick={() => openAnalytics(campaign)}
                        className="relative bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-6 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuAdId((prev) => (prev === campaign._id ? null : campaign._id));
                          }}
                          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openMenuAdId === campaign._id && (
                          <div className="absolute top-9 right-3 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAnalytics(campaign);
                                setOpenMenuAdId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <span>View Analytics</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCampaign(campaign);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <span>Edit campaign</span>
                            </button>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const confirmed = window.confirm('Are you sure you want to delete this campaign?');
                                if (!confirmed) return;
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) {
                                    alert('Please login to delete advertisements');
                                    return;
                                  }
                                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                                  const response = await fetch(`${API_URL}/api/advertisements/${campaign._id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  if (response.ok) {
                                    setUserCampaigns((prev) => prev.filter((ad) => ad._id !== campaign._id));
                                  } else {
                                    const errorData = await response.json();
                                    alert(errorData.error || 'Failed to delete advertisement');
                                  }
                                } catch (error) {
                                  console.error('Error deleting advertisement:', error);
                                  alert('Failed to delete advertisement. Please try again.');
                                } finally {
                                  setOpenMenuAdId(null);
                                }
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-b-lg"
                            >
                              <span>Delete campaign</span>
                            </button>
                          </div>
                        )}
                        <div className="flex gap-4">
                          {campaign.imageUrl && (
                            <img src={campaign.imageUrl} alt={campaign.title} className="w-32 h-32 object-cover rounded-lg" />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{campaign.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{campaign.description}</p>
                            <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Budget: ${campaign.budget}</span>
                              <span>Views: {campaign.views || 0}</span>
                              <span>Clicks: {campaign.clicks || 0}</span>
                              <span className={`px-2 py-1 rounded ${campaign.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {campaign.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Analytics Modal */}
                    {showAnalyticsModal && selectedAd && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Analytics</h2>
                            <button
                              onClick={() => setShowAnalyticsModal(false)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="p-6 space-y-6">
                            {/* Header Info */}
                            <div className="flex gap-6">
                              <img
                                src={selectedAd.imageUrl}
                                alt={selectedAd.title}
                                className="w-32 h-32 object-cover rounded-lg shadow-sm"
                              />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedAd.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{selectedAd.companyName}</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedAd.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                  {selectedAd.status?.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Simple Bar Chart */}
                            <div className="mt-6">
                              <h3 className="text-center font-semibold text-gray-900 dark:text-white mb-4">Monthly Views/Clicks</h3>
                              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
                                <div className="flex items-end justify-center gap-8 h-40">
                                  <div className="flex flex-col items-center">
                                    <div
                                      className="w-6 bg-blue-500 rounded-t"
                                      style={{
                                        height: `${((selectedAd.views || 0) / Math.max(selectedAd.views || 0, selectedAd.clicks || 0, calculateSpent(selectedAd) || 0, 1)) * 160}px`
                                      }}
                                    />
                                    <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Views</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <div
                                      className="w-6 bg-red-500 rounded-t"
                                      style={{
                                        height: `${((selectedAd.clicks || 0) / Math.max(selectedAd.views || 0, selectedAd.clicks || 0, calculateSpent(selectedAd) || 0, 1)) * 160}px`
                                      }}
                                    />
                                    <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Clicks</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <div
                                      className="w-6 bg-yellow-400 rounded-t"
                                      style={{
                                        height: `${(calculateSpent(selectedAd) / Math.max(selectedAd.views || 0, selectedAd.clicks || 0, calculateSpent(selectedAd) || 0, 1)) * 160}px`
                                      }}
                                    />
                                    <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Spent</span>
                                  </div>
                                </div>
                                <div className="mt-4 flex justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Views: {selectedAd.views || 0}</span>
                                  <span>Clicks: {selectedAd.clicks || 0}</span>
                                  <span>Spent: ${calculateSpent(selectedAd).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedAd.views || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Views</div>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedAd.clicks || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Clicks</div>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                  {((selectedAd.clicks || 0) / (selectedAd.views || 1) * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">CTR</div>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">${selectedAd.budget}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Budget</div>
                              </div>
                            </div>

                            {/* Details Section */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Campaign Details</h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 block">Start Date</span>
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {new Date(selectedAd.startDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 block">End Date</span>
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {new Date(selectedAd.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 block">Placement</span>
                                  <span className="text-gray-900 dark:text-white font-medium">{selectedAd.placement}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 block">Bidding Strategy</span>
                                  <span className="text-gray-900 dark:text-white font-medium">{selectedAd.bidding}</span>
                                </div>
                                {selectedAd.websiteUrl && (
                                  <div className="col-span-2">
                                    <span className="text-gray-500 dark:text-gray-400 block">Target URL</span>
                                    <a href={selectedAd.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block">
                                      {selectedAd.websiteUrl}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Target Audience */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Target Audience</h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 block">Location</span>
                                  <span className="text-gray-900 dark:text-white font-medium">{selectedAd.location || 'Global'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 block">Gender</span>
                                  <span className="text-gray-900 dark:text-white font-medium">{selectedAd.gender || 'All'}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-500 dark:text-gray-400 block">Interests</span>
                                  <span className="text-gray-900 dark:text-white font-medium">{selectedAd.audience || 'None selected'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl flex justify-end">
                            <button
                              onClick={() => setShowAnalyticsModal(false)}
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors font-medium"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit Campaign Modal */}
                    {editingAd && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Campaign</h2>
                            <button
                              onClick={() => setEditingAd(null)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="p-6 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                              <textarea
                                rows={3}
                                value={editForm.description}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placement</label>
                                <select
                                  value={editForm.placement}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const options = getBiddingOptions(value);
                                    setEditForm((prev) => ({
                                      ...prev,
                                      placement: value,
                                      bidding: options.includes(prev.bidding) ? prev.bidding : options[0]
                                    }));
                                  }}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="Entire Site (File Format image)">Entire Site (File Format image)</option>
                                  <option value="Post (File Format image)">Post (File Format image)</option>
                                  <option value="Sidebar (File Format image)">Sidebar (File Format image)</option>
                                  <option value="Jobs (File Format image)">Jobs (File Format image)</option>
                                  <option value="Forum (File Format image)">Forum (File Format image)</option>
                                  <option value="Fundings (File Format image)">Fundings (File Format image)</option>
                                  <option value="Story (File Format image)">Story (File Format image)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bidding</label>
                                <select
                                  value={editForm.bidding}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, bidding: e.target.value }))}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  {getBiddingOptions(editForm.placement).map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                <p className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                                  {new Date(editingAd.startDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                <p className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                                  {new Date(editingAd.endDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                <input
                                  type="text"
                                  value={editForm.location}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                <select
                                  value={editForm.gender}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value }))}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="All">All</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website URL</label>
                              <input
                                type="url"
                                value={editForm.websiteUrl}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b-xl">
                            <button
                              onClick={() => setEditingAd(null)}
                              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) {
                                    alert('Please login to update advertisements');
                                    return;
                                  }
                                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                                  const response = await fetch(`${API_URL}/api/advertisements/${editingAd._id}`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                      title: editForm.title,
                                      description: editForm.description,
                                      placement: editForm.placement,
                                      bidding: editForm.bidding,
                                      location: editForm.location,
                                      gender: editForm.gender,
                                      websiteUrl: editForm.websiteUrl
                                    })
                                  });
                                  if (response.ok) {
                                    const data = await response.json();
                                    setUserCampaigns((prev) =>
                                      prev.map((ad) => (ad._id === data.advertisement._id ? data.advertisement : ad))
                                    );
                                    setEditingAd(null);
                                  } else {
                                    const errorData = await response.json();
                                    alert(errorData.error || 'Failed to update advertisement');
                                  }
                                } catch (error) {
                                  console.error('Error updating advertisement:', error);
                                  alert('Failed to update advertisement. Please try again.');
                                }
                              }}
                              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                            >
                              Save changes
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Create New Ad Button */}
                    <div className="text-center pt-4">
                      <button
                        onClick={goToCreateAd}
                        className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition-colors"
                      >
                        Create New Advertisement
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No ads found. Create new ad and start getting traffic!
                    </h3>
                    <button
                      onClick={goToCreateAd}
                      className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition-colors mt-6"
                    >
                      Create advertisement
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-6">
                {/* Wallet Balance Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-6">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Current balance</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ${loadingWallet ? '...' : walletBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Funds</span>
                      </button>
                      <button
                        onClick={goToSendMoney}
                        className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Send money</span>
                      </button>
                      <button
                        onClick={goToWithdrawal}
                        className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
                          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Withdrawal</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transactions Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-6">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6">Transactions</h3>

                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Looks like you don't have any transaction yet!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={goToCreateAd}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Send Money View
  if (currentView === 'sendMoney') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={goBackToDashboard}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Wallet
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Send money to friends</h1>
          </div>
        </div>

        {/* Send Money Content */}
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {/* Warning Message */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                Your current wallet balance is: 0, please top up your wallet to continue.
                <button className="text-orange-600 dark:text-orange-400 underline ml-1">Top up</button>
              </p>
            </div>

            {/* Amount Section */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Amount</h2>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-light text-gray-400 dark:text-gray-500">$</span>
                <span className="text-6xl font-light text-gray-400 dark:text-gray-500 ml-2">0</span>
              </div>
            </div>

            {/* Recipient Section */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="To who you want to send?"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 text-center">Search by username or email</p>
            </div>

            {/* Continue Button */}
            <button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Withdrawal View
  if (currentView === 'withdrawal') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={goBackToDashboard}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Wallet
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Earnings $0.00</h1>
          </div>
        </div>

        {/* Withdrawal Content */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {/* Warning Messages */}
            <div className="space-y-4 mb-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Available funds to withdrawal: $0, minimum withdrawal request is $50
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Please note that you are able to withdrawal only your Earnings, wallet top ups are not withdrawable.
                </p>
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Withdraw Method</label>
                <p className="text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">PayPal</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PayPal email</label>
                <input
                  type="email"
                  value="sadafhina197@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  defaultValue="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
                Request withdrawal
              </button>
            </div>

            {/* Payment History */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h3>
              </div>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No payment history available
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Create Ad View
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar - Ad Preview */}
        {adPreviewOpen && (
          <div className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {/* Logo Section */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                  J
                </div>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>jaifriend</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ad preview</h3>
              <button
                onClick={() => setAdPreviewOpen(false)}
                className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} p-4`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {companyName ? companyName[0].toUpperCase() : 'C'}
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {companyName || 'Company'}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</p>
                  </div>
                </div>
                {imagePreview ? (
                  <img src={imagePreview} alt="Ad preview" className="w-full rounded-lg mb-3" />
                ) : (
                  <div className={`w-full h-48 rounded-lg mb-3 flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Image preview</p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {campaignTitle || 'Title'}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {campaignDescription || 'Description'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 w-full">
          {/* Header */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} px-4 sm:px-6 py-4`}>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Advertisement</h1>
          </div>

          {/* Tabs */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="px-4 sm:px-6 flex gap-4 sm:gap-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'campaigns'
                  ? isDarkMode
                    ? 'border-blue-500 text-blue-400'
                    : 'border-blue-500 text-blue-600'
                  : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'wallet'
                  ? isDarkMode
                    ? 'border-blue-500 text-blue-400'
                    : 'border-blue-500 text-blue-600'
                  : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Wallet & Credits
              </button>
            </div>
          </div>

          {/* Step Navigation */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 sm:px-6 py-4`}>
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setCurrentStep('media')}
                className={`flex items-center ${currentStep === 'media' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')} cursor-pointer`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'media' ? (isDarkMode ? 'bg-blue-500' : 'bg-blue-600') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')} ${currentStep === 'media' ? 'text-white' : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Media</span>
              </button>
              <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <button
                onClick={() => setCurrentStep('details')}
                className={`flex items-center ${currentStep === 'details' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')} cursor-pointer`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'details' ? (isDarkMode ? 'bg-blue-500' : 'bg-blue-600') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')} ${currentStep === 'details' ? 'text-white' : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Details</span>
              </button>
              <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <button
                onClick={() => setCurrentStep('targeting')}
                className={`flex items-center ${currentStep === 'targeting' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')} cursor-pointer`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'targeting' ? (isDarkMode ? 'bg-blue-500' : 'bg-blue-600') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')} ${currentStep === 'targeting' ? 'text-white' : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Targeting</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-6`}>
            {/* Warning Message - Only show if wallet balance is 0 */}
            {walletBalance === 0 && (
              <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                  Your current wallet balance is: 0, please top up your wallet to continue.{' '}
                  <button className={`underline ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Top up</button>
                </p>
              </div>
            )}

            {/* Form Content */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
              {currentStep === 'media' && (
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Company name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Select an image for your campaign.
                    </p>
                    <div className={`border-2 border-dashed rounded-lg p-12 text-center ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Choose Image
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'details' && (
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Campaign title
                    </label>
                    <input
                      type="text"
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      placeholder="Enter campaign title"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Campaign description
                    </label>
                    <textarea
                      value={campaignDescription}
                      onChange={(e) => setCampaignDescription(e.target.value)}
                      placeholder="Tell users what your campaign is about"
                      rows={4}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Start date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Select campaign starting date, UTC"
                        min={todayStr}
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Select campaign starting date, UTC
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        End date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="Select campaign ending date, UTC"
                        min={startDate || todayStr}
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Select campaign ending date, UTC
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="Select a page or enter a link to your site"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Select a page or enter a link to your site
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      My Pages
                    </label>
                    <select
                      value={myPages}
                      onChange={(e) => setMyPages(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      disabled={loadingPages}
                    >
                      <option value="">Select a page</option>
                      {userPages.map((page) => (
                        <option key={page._id || page.id} value={page._id || page.id}>
                          {page.name || page.pageName || 'Unnamed Page'}
                        </option>
                      ))}
                    </select>
                    {loadingPages && (
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Loading pages...
                      </p>
                    )}
                    {!loadingPages && userPages.length === 0 && (
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No pages found. Create a page first.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 'targeting' && (
                <div className="flex gap-6">
                  <div className="flex-1 space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Placement
                      </label>
                      <select
                        value={placement}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPlacement(value);
                          const options = getBiddingOptions(value);
                          if (!options.includes(bidding)) {
                            setBidding(options[0]);
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="Entire Site (File Format image)">Entire Site (File Format image)</option>
                        <option value="Post (File Format image)">Post (File Format image)</option>
                        <option value="Sidebar (File Format image)">Sidebar (File Format image)</option>
                        <option value="Jobs (File Format image)">Jobs (File Format image)</option>
                        <option value="Forum (File Format image)">Forum (File Format image)</option>
                        <option value="Fundings (File Format image)">Fundings (File Format image)</option>
                        <option value="Story (File Format image)">Story (File Format image)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Bidding
                      </label>
                      <select
                        value={bidding}
                        onChange={(e) => setBidding(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        {getBiddingOptions(placement).map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter location"
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Audience
                      </label>
                      <div className={`w-full rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                        <button
                          type="button"
                          onClick={() => setIsAudienceOpen((prev) => !prev)}
                          className="w-full px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-600"
                        >
                          <p className={`text-xs font-medium text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {audience.length === 0 ? 'Nothing selected' : audience.join(', ')}
                          </p>
                          <svg
                            className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transform transition-transform ${
                              isAudienceOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isAudienceOpen && (
                          <>
                            <div className="px-4 py-2 flex justify-between text-xs border-b border-gray-200 dark:border-gray-600">
                              <button
                                type="button"
                                onClick={() => setAudience(countryOptions)}
                                className={`${isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}`}
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={() => setAudience([])}
                                className={`${isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}`}
                              >
                                Deselect All
                              </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto py-2 text-sm">
                              {countryOptions.map((country) => {
                                const checked = audience.includes(country);
                                return (
                                  <label
                                    key={country}
                                    className={`flex items-center gap-2 px-4 py-1 cursor-pointer ${
                                      isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-800 hover:bg-gray-100'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        setAudience((prev) =>
                                          prev.includes(country)
                                            ? prev.filter((c) => c !== country)
                                            : [...prev, country]
                                        );
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{country}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Campaign Budget
                      </label>
                      <input
                        type="number"
                        value={campaignBudget}
                        onChange={(e) => setCampaignBudget(e.target.value)}
                        placeholder="Enter the amount you want to spend on this campaign"
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="All">All</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* Estimated Reach Card */}
                  <div className="w-80">
                    <div className={`${isDarkMode ? 'bg-purple-900/30 border-purple-800' : 'bg-purple-50 border-purple-200'} border rounded-lg p-6 sticky top-6`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-800' : 'bg-purple-100'}`}>
                          <svg className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                          Estimated reach
                        </h3>
                      </div>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-100' : 'text-purple-900'}`}>
                        0 Users
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className={`flex justify-between items-center mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => {
                    if (currentStep === 'media') {
                      goBackToDashboard();
                    } else if (currentStep === 'details') {
                      setCurrentStep('media');
                    } else if (currentStep === 'targeting') {
                      setCurrentStep('details');
                    }
                  }}
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                >
                  Go back
                </button>
                <div className="flex gap-3">
                  {currentStep !== 'media' && (
                    <button
                      onClick={() => {
                        if (currentStep === 'details') setCurrentStep('media');
                        if (currentStep === 'targeting') setCurrentStep('details');
                      }}
                      className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                    >
                      Previous
                    </button>
                  )}
                  {currentStep !== 'targeting' && (
                    <button
                      onClick={() => {
                        if (currentStep === 'media') setCurrentStep('details');
                        if (currentStep === 'details') setCurrentStep('targeting');
                      }}
                      className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                    >
                      Next
                    </button>
                  )}
                  {currentStep === 'targeting' && (
                    <button
                      onClick={handlePublishAd}
                      disabled={creatingAd}
                      className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {creatingAd ? 'Publishing...' : 'Publish'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default AdvertisingPage;

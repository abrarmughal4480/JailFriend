'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { websiteSettingsApi } from '@/utils/websiteSettingsApi';

interface Feature {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  hasConfig?: boolean;
  inputType?: 'toggle' | 'input' | 'select';
  inputValue?: string | number;
  inputOptions?: { value: string; label: string }[];
  inputPlaceholder?: string;
  inputLabel?: string;
}

const EnableDisableFeatures = () => {
  const { isDarkMode } = useDarkMode();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [pointsConfig, setPointsConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settings = await websiteSettingsApi.getSettings();
      
      // Map features from settings
      const featuresList: Feature[] = [
        {
          key: 'greetingSystem',
          label: 'Greeting System',
          description: 'Shows good afternoon, morning and evening messages on home page.',
          enabled: (settings as any).features?.greetingSystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'pokeSystem',
          label: 'Poke System',
          description: 'Gives the ability for users to poke each other.',
          enabled: (settings as any).features?.pokeSystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'games',
          label: 'Games System',
          description: 'Allow users to play games, you can add games from Add New Game.',
          enabled: settings.features?.games ?? true,
          inputType: 'toggle',
          hasConfig: true
        },
        {
          key: 'pages',
          label: 'Pages System',
          description: 'Allow users to create fan pages.',
          enabled: settings.features?.pages ?? true,
          inputType: 'toggle',
          hasConfig: true
        },
        {
          key: 'nearbyBusinesses',
          label: 'Nearby Businesses',
          description: 'Allow users to find nearby businesses (pages).',
          enabled: (settings as any).features?.nearbyBusinesses ?? true,
          inputType: 'toggle'
        },
        {
          key: 'groups',
          label: 'Groups System',
          description: 'Allow users to create groups.',
          enabled: settings.features?.groups ?? true,
          inputType: 'toggle',
          hasConfig: true
        },
        {
          key: 'marketplace',
          label: 'Classified System (MarketPlace)',
          description: 'Allow users to sell and list their products.',
          enabled: settings.features?.marketplace ?? true,
          inputType: 'toggle'
        },
        {
          key: 'offerSystem',
          label: 'Offer System (MarketPlace)',
          description: 'Allow pages to create offers and discounts for their products.',
          enabled: (settings as any).features?.offerSystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'nearbyShops',
          label: 'Nearby Shops',
          description: 'Show nearby shops and products.',
          enabled: (settings as any).features?.nearbyShops ?? true,
          inputType: 'toggle'
        },
        {
          key: 'marketplaceVisibility',
          label: 'MarketPlace Visibility',
          description: 'Who can view and access marketplace?',
          enabled: true,
          inputType: 'select',
          inputValue: (settings as any).general?.marketplaceVisibility || 'Registered Users Only',
          inputOptions: [
            { value: 'All Users', label: 'All Users' },
            { value: 'Registered Users Only', label: 'Registered Users Only' }
          ]
        },
        {
          key: 'blogsSystem',
          label: 'Blogs System',
          description: 'Allow users to create blogs.',
          enabled: (settings as any).features?.blogsSystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'blogApprovalSystem',
          label: 'Blog Approval System',
          description: 'Send blog posts to admin for reviewing before publishing.',
          enabled: (settings as any).features?.blogApprovalSystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'events',
          label: 'Events System',
          description: 'Allow users to create events.',
          enabled: settings.features?.events ?? true,
          inputType: 'toggle'
        },
        {
          key: 'eventsVisibility',
          label: 'Events Visibility',
          description: 'Who can view and access events?',
          enabled: true,
          inputType: 'select',
          inputValue: (settings as any).general?.eventsVisibility || 'All Users',
          inputOptions: [
            { value: 'All Users', label: 'All Users' },
            { value: 'Registered Users Only', label: 'Registered Users Only' }
          ]
        },
        {
          key: 'forum',
          label: 'Forums System',
          description: 'Allow users to create forums.',
          enabled: settings.features?.forum ?? true,
          inputType: 'toggle'
        },
        {
          key: 'forumsVisibility',
          label: 'Forums Visibility',
          description: 'Who can view and access forums?',
          enabled: true,
          inputType: 'select',
          inputValue: (settings as any).general?.forumsVisibility || 'Registered Users Only',
          inputOptions: [
            { value: 'All Users', label: 'All Users' },
            { value: 'Registered Users Only', label: 'Registered Users Only' }
          ]
        },
        {
          key: 'movies',
          label: 'Movies System',
          description: 'Allow users to watch movies, movies can be added only by admins, you can manage movies from Manage Movies.',
          enabled: settings.features?.movies ?? true,
          inputType: 'toggle'
        },
        {
          key: 'stories',
          label: 'Story / Status System',
          description: 'Allow users to create stories & status that expire after 24 hours.',
          enabled: settings.features?.stories ?? true,
          inputType: 'toggle'
        },
        {
          key: 'gifSystem',
          label: 'GIF System',
          description: 'Allow users to share gif images in posts, comments, and chats.',
          enabled: (settings as any).features?.gifSystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'stickersSystem',
          label: 'Stickers System',
          description: 'Allow users to send and post stickers. You can manage, edit and add stickers from Add New Sticker.',
          enabled: (settings as any).features?.stickersSystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'nearbyFriendsSystem',
          label: 'Nearby Friends System',
          description: 'Allow users to search nearby users.',
          enabled: (settings as any).features?.nearbyFriendsSystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'giftSystem',
          label: 'GIFT System',
          description: 'Allow users to send gifts. You can manage, add and edit gifts from Add New Sticker.',
          enabled: (settings as any).features?.giftSystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'jobsSystem',
          label: 'Jobs System',
          description: 'Allow pages to create jobs, users can apply and get hired.',
          enabled: (settings as any).features?.jobsSystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'watchPage',
          label: 'Watch Page',
          description: 'Enables or disables watch page in the site.',
          enabled: (settings as any).features?.watchPage ?? true,
          inputType: 'toggle'
        },
        {
          key: 'postMonetization',
          label: 'Post Monetization',
          description: 'Enables or disables monetization in the site.',
          enabled: (settings as any).features?.postMonetization ?? true,
          inputType: 'toggle'
        },
        {
          key: 'monetizationEarnPercentage',
          label: 'Monetization Earn Percentage',
          description: 'How much percentage of the monetization will the system get?',
          enabled: true,
          inputType: 'input',
          inputValue: (settings as any).general?.monetizationEarnPercentage || 10,
          inputPlaceholder: '10'
        },
        {
          key: 'directorySystem',
          label: 'Directory System',
          description: 'Enables or disables watch page in the site.',
          enabled: (settings as any).features?.directorySystem ?? true,
          inputType: 'toggle'
        },
        {
          key: 'commonThingsPage',
          label: 'Common Things Page',
          description: 'Allow users to find common things between them.',
          enabled: (settings as any).features?.commonThingsPage ?? true,
          inputType: 'toggle'
        },
        {
          key: 'weatherWidget',
          label: 'Weather Widget',
          description: 'Please register to this site and use the key',
          enabled: (settings as any).features?.weatherWidget ?? true,
          inputType: 'toggle'
        },
        {
          key: 'weatherAppId',
          label: 'Weather APP ID',
          description: 'Use the APP ID from openweathermap.org',
          enabled: true,
          inputType: 'input',
          inputValue: (settings as any).apiKeys?.weatherAppId || '',
          inputPlaceholder: 'Use the APP ID from openweathermap.org'
        }
      ];

      setFeatures(featuresList);

      // Points & Level Configuration
      setPointsConfig({
        pointsLevelSystem: (settings as any).features?.pointsLevelSystem ?? false,
        withdrawalEarnedPoints: (settings as any).features?.withdrawalEarnedPoints ?? false,
        dollarToPoint: (settings as any).general?.dollarToPoint || 1000,
        freeUserDailyLimit: (settings as any).general?.freeUserDailyLimit || 1000,
        proUserDailyLimit: (settings as any).general?.proUserDailyLimit || 2000,
        commentsPoints: (settings as any).general?.commentsPoints || 10,
        likesPoints: (settings as any).general?.likesPoints || 5,
        dislikesPoints: (settings as any).general?.dislikesPoints || 2,
        wondersPoints: (settings as any).general?.wondersPoints || 3,
        reactionPoints: (settings as any).general?.reactionPoints || 5,
        createPostPoints: (settings as any).general?.createPostPoints || 15,
        createBlogPoints: (settings as any).general?.createBlogPoints || 15,
        admobPoints: (settings as any).general?.admobPoints || 5
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async (featureKey: string, currentValue: boolean) => {
    try {
      setUpdating(featureKey);
      
      // Check if it's a feature toggle or general setting
      const feature = features.find(f => f.key === featureKey);
      if (feature?.inputType === 'toggle') {
        await websiteSettingsApi.updateFeature(featureKey, !currentValue);
        setFeatures(prev => prev.map(f => 
          f.key === featureKey ? { ...f, enabled: !currentValue } : f
        ));
      }
      
      alert(`Feature updated successfully!`);
    } catch (error) {
      console.error('Error updating feature:', error);
      alert('Failed to update feature. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleInputChange = async (featureKey: string, value: string | number) => {
    try {
      setUpdating(featureKey);
      
      const feature = features.find(f => f.key === featureKey);
      if (feature?.inputType === 'select' || feature?.inputType === 'input') {
        await websiteSettingsApi.updateGeneralSetting(featureKey, value);
        setFeatures(prev => prev.map(f => 
          f.key === featureKey ? { ...f, inputValue: value } : f
        ));
      }
      
      alert('Setting updated successfully!');
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Failed to update setting. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handlePointsConfigChange = async (key: string, value: boolean | number) => {
    try {
      setUpdating(key);
      
      if (typeof value === 'boolean') {
        await websiteSettingsApi.updateFeature(key, value);
      } else {
        await websiteSettingsApi.updateGeneralSetting(key, value);
      }
      
      setPointsConfig((prev: any) => ({ ...prev, [key]: value }));
      alert('Points configuration updated successfully!');
    } catch (error) {
      console.error('Error updating points config:', error);
      alert('Failed to update points configuration. Please try again.');
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
                Settings
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>Manage Website Features</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
          Manage Website Features
        </h1>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Manage Website Features */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Manage Website Features
            </h2>
            
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.key} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4 last:border-b-0 last:pb-0`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {feature.label}
                        </h3>
                        {feature.hasConfig && (
                          <button className="text-red-400 hover:text-red-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        {feature.description}
                      </p>
                      
                      {feature.inputType === 'select' && (
                        <select
                          value={feature.inputValue as string}
                          onChange={(e) => handleInputChange(feature.key, e.target.value)}
                          disabled={updating === feature.key}
                          className={`mt-2 w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        >
                          {feature.inputOptions?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {feature.inputType === 'input' && (
                        <input
                          type="text"
                          value={feature.inputValue || ''}
                          onChange={(e) => handleInputChange(feature.key, e.target.value)}
                          onBlur={(e) => handleInputChange(feature.key, e.target.value)}
                          disabled={updating === feature.key}
                          placeholder={feature.inputPlaceholder}
                          className={`mt-2 w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        />
                      )}
                    </div>
                    
                    {feature.inputType === 'toggle' && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleToggleFeature(feature.key, feature.enabled)}
                          disabled={updating === feature.key}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            feature.enabled
                              ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
                              : isDarkMode ? 'bg-red-600' : 'bg-red-500'
                          } ${updating === feature.key ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              feature.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                          {feature.enabled ? (
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Point & Level Configuration */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Point & Level Configuration
            </h2>
            
            <div className="space-y-4">
              {/* Points & Level System */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                      Points & Level System
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Gives the ability for users to earn points from liking, sharing, commenting and posting.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePointsConfigChange('pointsLevelSystem', !pointsConfig.pointsLevelSystem)}
                    disabled={updating === 'pointsLevelSystem'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pointsConfig.pointsLevelSystem
                        ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
                        : isDarkMode ? 'bg-red-600' : 'bg-red-500'
                    } ${updating === 'pointsLevelSystem' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pointsConfig.pointsLevelSystem ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Withdrawal Earned Points */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                      Withdrawal Earned Points
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Allow users to transfer earned points into money and withdrawal.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePointsConfigChange('withdrawalEarnedPoints', !pointsConfig.withdrawalEarnedPoints)}
                    disabled={updating === 'withdrawalEarnedPoints'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pointsConfig.withdrawalEarnedPoints
                        ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
                        : isDarkMode ? 'bg-red-600' : 'bg-red-500'
                    } ${updating === 'withdrawalEarnedPoints' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pointsConfig.withdrawalEarnedPoints ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dollar to Point */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    $1.00 = ? Point
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How much does 1 dollar equal in points?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.dollarToPoint || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, dollarToPoint: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('dollarToPoint', pointsConfig.dollarToPoint)}
                    disabled={updating === 'dollarToPoint'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Free User Daily Limit */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Free User Daily Limit
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How many points can a free user earn in a day?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.freeUserDailyLimit || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, freeUserDailyLimit: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('freeUserDailyLimit', pointsConfig.freeUserDailyLimit)}
                    disabled={updating === 'freeUserDailyLimit'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Pro User Daily Limit */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Pro User Daily Limit
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How many points can a pro user earn in a day?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.proUserDailyLimit || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, proUserDailyLimit: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('proUserDailyLimit', pointsConfig.proUserDailyLimit)}
                    disabled={updating === 'proUserDailyLimit'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="2000"
                  />
                </div>
              </div>

              {/* Comments Points */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Comments
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How many points does a user earn by creating comments?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.commentsPoints || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, commentsPoints: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('commentsPoints', pointsConfig.commentsPoints)}
                    disabled={updating === 'commentsPoints'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Likes Points */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Likes
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How many points does a user earn by liking posts?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.likesPoints || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, likesPoints: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('likesPoints', pointsConfig.likesPoints)}
                    disabled={updating === 'likesPoints'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="5"
                  />
                </div>
              </div>

              {/* DisLikes Points */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    DisLikes
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How many points does a user earn by disliking posts?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.dislikesPoints || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, dislikesPoints: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('dislikesPoints', pointsConfig.dislikesPoints)}
                    disabled={updating === 'dislikesPoints'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="2"
                  />
                </div>
              </div>

              {/* Wonders Points */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Wonders
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How many points does a user earn by wondering posts?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.wondersPoints || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, wondersPoints: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('wondersPoints', pointsConfig.wondersPoints)}
                    disabled={updating === 'wondersPoints'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="3"
                  />
                </div>
              </div>

              {/* Reaction Points */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Reaction
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How many points does a user earn by reacting to posts?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.reactionPoints || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, reactionPoints: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('reactionPoints', pointsConfig.reactionPoints)}
                    disabled={updating === 'reactionPoints'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Create New Post Points */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Create New Post
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How many points does a user earn by creating new posts?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.createPostPoints || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, createPostPoints: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('createPostPoints', pointsConfig.createPostPoints)}
                    disabled={updating === 'createPostPoints'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="15"
                  />
                </div>
              </div>

              {/* Create A Blog Points */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Create A Blog
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How many points does a user earn by creating new articles?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.createBlogPoints || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, createBlogPoints: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('createBlogPoints', pointsConfig.createBlogPoints)}
                    disabled={updating === 'createBlogPoints'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="15"
                  />
                </div>
              </div>

              {/* AdMob Points */}
              <div className="pb-4">
                <div className="flex-1 mb-2">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    AdMob
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    How many points does a user earn by watching ads?
                  </p>
                  <input
                    type="number"
                    value={pointsConfig.admobPoints || ''}
                    onChange={(e) => setPointsConfig({ ...pointsConfig, admobPoints: parseInt(e.target.value) || 0 })}
                    onBlur={() => handlePointsConfigChange('admobPoints', pointsConfig.admobPoints)}
                    disabled={updating === 'admobPoints'}
                    className={`w-full px-3 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnableDisableFeatures;

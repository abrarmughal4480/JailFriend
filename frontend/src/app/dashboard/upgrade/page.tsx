"use client";
import React, { useState } from 'react';
import { ArrowLeft, Crown, Check, Star, Zap, Rocket, Users, Shield, ChevronDown, Menu, X } from 'lucide-react';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';

const PricingPage = () => {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const [selectedPlan, setSelectedPlan] = useState('Hot');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState(false);

  const plans = [
    {
      name: 'Star',
      monthlyPrice: 4,
      yearlyPrice: 40,
      period: billingPeriod === 'monthly' ? '/ month' : '/ year',
      icon: Star,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-500 hover:bg-green-600 text-white',
      features: [
        'Featured member',
        'See profile visitors',
        'Show / Hide last seen',
        'Verified badge'
      ],
      details: [
        'No Posts promotion',
        '2 Pages',
        'No Discount',
        '24 MB storage'
      ],
      cta: 'Get started!',
      popular: false,
      savings: 17
    },
    {
      name: 'Hot',
      monthlyPrice: 8,
      yearlyPrice: 80,
      period: billingPeriod === 'monthly' ? '/ month' : '/ year',
      icon: Zap,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonColor: 'bg-red-500 hover:bg-red-600 text-white',
      features: [
        'Featured member',
        'See profile visitors',
        'Show / Hide last seen',
        'Verified badge'
      ],
      details: [
        '5 posts promotion',
        '5 Pages',
        '10% Discount',
        '96 MB storage'
      ],
      cta: 'Get Hot! More features.',
      popular: true,
      savings: 17
    },
    {
      name: 'Ultima',
      monthlyPrice: 89,
      yearlyPrice: 890,
      period: billingPeriod === 'monthly' ? '/ month' : '/ year',
      icon: Crown,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      buttonColor: 'bg-orange-500 hover:bg-orange-600 text-white',
      features: [
        'Featured member',
        'See profile visitors',
        'Show / Hide last seen',
        'Verified badge'
      ],
      details: [
        '20 posts promotion',
        '20 Pages',
        '20% Discount',
        '256 MB storage'
      ],
      cta: 'Oh yeah, join the ultima!',
      popular: false,
      savings: 17
    },
    {
      name: 'VIP',
      monthlyPrice: 259,
      yearlyPrice: 2590,
      period: billingPeriod === 'monthly' ? '/ month' : '/ unlimited',
      icon: Rocket,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-500 hover:bg-blue-600 text-white',
      features: [
        'Featured member',
        'See profile visitors',
        'Show / Hide last seen',
        'Verified badge'
      ],
      details: [
        '40 posts promotion',
        '40 Pages',
        '60% Discount',
        'Unlimited storage'
      ],
      cta: 'GO Limitless!',
      popular: false,
      savings: 17
    }
  ];

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
  const handleUpgrade = async (planName: string) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) return alert('User not found!');
    
    try {
  const res = await fetch(`${API_URL}/api/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          plan: planName,
          billing: billingPeriod
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Upgrade successful!');
        setSelectedPlan(planName);
      } else {
        alert(data.error || 'Upgrade failed');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const getCurrentPrice = (plan: any) => {
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pricing Plans</h1>
            </div>
            
            <button
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                Compare Plans
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                FAQ
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 mb-8 sm:mb-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
                <div className="flex-1 max-w-2xl">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                      Jaifriend <span className="bg-orange-500 text-white px-2 py-1 rounded-lg text-sm sm:text-base">PRO</span>
                    </h1>
                  </div>
                  
                  <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">
                    Unlock premium features and take complete control over your profile experience.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[
                      'Pro features give you complete control',
                      'Featured member status',
                      'Advanced privacy controls',
                      'Post promotion capabilities',
                      'Verified badge',
                      'Priority support'
                    ].slice(0, expandedFeatures ? 6 : 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        </div>
                        <span className="text-sm sm:text-base text-blue-100">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setExpandedFeatures(!expandedFeatures)}
                    className="sm:hidden mt-4 flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
                  >
                    <span className="text-sm">{expandedFeatures ? 'Show less' : 'Show more'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedFeatures ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {/* Illustration - Hidden on mobile */}
                <div className="hidden lg:block flex-shrink-0">
                  <div className="w-48 xl:w-64 h-36 xl:h-48 relative">
                    <div className="absolute bottom-0 right-0">
                      <div className="w-24 xl:w-32 h-16 xl:h-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full relative">
                        <div className="absolute -top-6 xl:-top-8 left-1/2 transform -translate-x-1/2">
                          <div className="w-12 xl:w-16 h-12 xl:h-16 bg-blue-500 rounded-full flex items-center justify-center">
                            <Users className="w-6 xl:w-8 h-6 xl:h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-8 w-8 xl:w-12 h-4 xl:h-6 bg-white/20 rounded-full"></div>
                    <div className="absolute top-8 right-16 xl:right-20 w-10 xl:w-16 h-5 xl:h-8 bg-white/10 rounded-full"></div>
                    <div className="absolute top-12 right-4 w-6 xl:w-10 h-3 xl:h-5 bg-white/15 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/20 to-transparent"></div>
          </div>

          {/* Billing Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left mb-2">
                Choose Your Plan
              </h2>
              <p className="text-gray-600 text-center sm:text-left">
                Select the perfect plan for your needs
              </p>
            </div>
            
            <div className="bg-gray-100 rounded-xl p-1 flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pro Members Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-8 sm:mb-12 border border-white/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Current Pro Members</h3>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full overflow-hidden flex items-center justify-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">Vicky and 1,247+ others</p>
                <p className="text-xs sm:text-sm text-gray-500">are already enjoying pro features</p>
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              const currentPrice = getCurrentPrice(plan);
              
              return (
                <div
                  key={plan.name}
                  className={`${plan.bgColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 relative transition-all duration-300 hover:shadow-xl border-2 ${
                    selectedPlan === plan.name 
                      ? 'border-blue-500 shadow-lg scale-105' 
                      : `${plan.borderColor} hover:border-opacity-60`
                  } ${plan.popular ? 'lg:scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                        🔥 Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-4 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 ${plan.iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                      <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${plan.iconColor}`} />
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                    
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-gray-600">$</span>
                      <span className="text-2xl sm:text-3xl font-bold text-gray-800">{currentPrice}</span>
                      <span className="text-sm text-gray-600">{plan.period}</span>
                    </div>
                    
                    {billingPeriod === 'yearly' && plan.savings && (
                      <div className="mt-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Save {plan.savings}%
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 mb-4 sm:mb-6 text-sm sm:text-base ${plan.buttonColor} hover:shadow-md active:scale-95`}
                  >
                    {selectedPlan === plan.name ? 'Current Plan' : 'Upgrade Now'}
                  </button>

                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6 border-t border-gray-200 pt-4">
                    {plan.details.map((detail, index) => (
                      <div key={index} className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                        {detail}
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">{plan.cta}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 sm:mt-16 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>1,000+ Happy Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

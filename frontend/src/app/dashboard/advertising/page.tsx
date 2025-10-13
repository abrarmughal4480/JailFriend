"use client";
import React, { useState } from 'react';

const AdvertisingPage = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'createAd', 'sendMoney', 'withdrawal'
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

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
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'wallet'
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Wallet & Credits
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'campaigns' && (
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

            {activeTab === 'wallet' && (
              <div className="space-y-6">
                {/* Wallet Balance Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-6">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Current balance</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">$0.00</span>
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
  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide pb-24 sm:pb-0">
      {/* Back Button */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={goBackToDashboard}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Reach Gen Z and Millennials with<br />Jaifriend Ads
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Jaifriend reaches 90% of the 13-24 year old population and 75% of the 13-34 year old population in 25+ countries.
            <sup className="text-blue-600 dark:text-blue-400">1</sup>
          </p>
          <button className="bg-orange-400 hover:bg-orange-500 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
            Create an Ad
          </button>
        </div>
      </div>

      {/* Interests Section */}
      <div className="bg-gray-100 dark:bg-gray-700 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            What are you interested in today?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {interests.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2 ${
                  selectedInterests.includes(interest.id)
                    ? 'bg-orange-500 dark:bg-orange-600 text-white'
                    : 'bg-orange-300 dark:bg-orange-400 hover:bg-orange-400 dark:hover:bg-orange-500 text-gray-800 dark:text-gray-900'
                }`}
              >
                <span>{interest.icon}</span>
                {interest.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connection Section */}
      <div className="bg-white dark:bg-gray-800 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616c5e2d8d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Young woman with camera"
                className="w-full max-w-md rounded-lg shadow-lg"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Jaifriend is where Gen Z and Millennials stay connected
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Snapchat reaches 75% of 13-34 year olds in over 25 countries.
                <sup className="text-blue-600 dark:text-blue-400">1</sup> With a spending power of $5 trillion, this audience represents a significant opportunity for businesses of any size.
                <sup className="text-blue-600 dark:text-blue-400">2</sup>
              </p>
              <button className="bg-orange-400 hover:bg-orange-500 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                Meet The Audience
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Formats Section */}
      <div className="bg-gray-900 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            Ads captivate and ignite action
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((item) => (
              <div key={item} className="text-center">
                <div className="w-48 h-64 mx-auto mb-4 rounded-lg overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${1500000000000 + item}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                    alt="Ad format example"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Name</h3>
                <p className="text-gray-300 text-sm">
                  Snapchat Ads are fullscreen and immersive, encouraging viewers to learn more.
                </p>
              </div>
            ))}
          </div>
          <button className="bg-orange-400 hover:bg-orange-500 text-white px-8 py-3 rounded-full font-semibold transition-colors">
            Explore AD Formats
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-orange-400 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Advertising Today
          </h2>
          <p className="text-white text-lg mb-8">
            To help you get started, get a $375 ad credit when you spend $350 on your first ad.
          </p>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-semibold transition-colors">
            create an ad
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvertisingPage;

"use client";
import React, { useState } from 'react';
import { Plus, DollarSign, ArrowLeft, Upload, Search, Users, Menu, X } from 'lucide-react';

const FundingsPage = () => {
  const [activeTab, setActiveTab] = useState('My Funding Requests');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    amount: string;
    description: string;
    image: File | null;
  }>({
    title: '',
    amount: '',
    description: '',
    image: null
  });

  const tabs = ['My Funding Requests', 'Browse Funding'];

  // Mock funding data for demonstration
  const mockFundings = [
    {
      id: 1,
      title: 'Tech Startup Launch',
      amount: '$50,000',
      description: 'Revolutionary AI-powered mobile app for food delivery optimization.',
      raised: '$12,500',
      percentage: 25,
      backers: 42,
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Community Garden Project',
      amount: '$15,000',
      description: 'Creating sustainable urban farming spaces for local communities.',
      raised: '$8,750',
      percentage: 58,
      backers: 127,
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Educational Platform',
      amount: '$25,000',
      description: 'Online learning platform for underserved communities worldwide.',
      raised: '$18,900',
      percentage: 76,
      backers: 89,
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateFunding = () => {
    setShowCreateForm(true);
    setMobileMenuOpen(false);
  };

  const handleGoBack = () => {
    setShowCreateForm(false);
    setFormData({
      title: '',
      amount: '',
      description: '',
      image: null
    });
  };

  const handlePublish = () => {
    console.log('Publishing funding request:', formData);
    setShowCreateForm(false);
    setFormData({
      title: '',
      amount: '',
      description: '',
      image: null
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // Funding Card Component
  const FundingCard = ({ funding }: { funding: any }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <img 
        src={funding.image} 
        alt={funding.title}
        className="w-full h-40 sm:h-48 object-cover"
      />
      <div className="p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">{funding.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{funding.description}</p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Raised: {funding.raised}</span>
            <span className="text-gray-600">{funding.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${funding.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{funding.backers} backers</span>
            <span>Goal: {funding.amount}</span>
          </div>
        </div>

        <button className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
          Support Project
        </button>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
        <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
      </div>
      <p className="text-gray-600 text-center font-medium mb-4 sm:mb-6 text-sm sm:text-base">
        No funding to show
      </p>
      <button
        onClick={handleCreateFunding}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors text-sm"
      >
        Create
      </button>
    </div>
  );

  // Browse Funding Component
  const BrowseFunding = () => (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {mockFundings.map((funding) => (
          <FundingCard key={funding.id} funding={funding} />
        ))}
      </div>
      
      {/* Load More */}
      <div className="mt-8 text-center">
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
          Load more projects
        </button>
      </div>
    </div>
  );

  // Create Form Component
  const CreateForm = () => (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
        <h2 className="text-base sm:text-lg font-medium text-gray-900">Create new funding request</h2>
      </div>

      {/* Form */}
      <div className="space-y-4 sm:space-y-6">
        
        {/* Title Field */}
        <div>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Amount Field */}
        <div>
          <input
            type="text"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-2">How much money you would like to receive?</p>
        </div>

        {/* Description Field */}
        <div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
          />
        </div>

        {/* Image Upload */}
        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">Select an image</p>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 sm:p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </div>
              <button
                type="button"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition-colors text-sm"
              >
                Browse To Upload
              </button>
              {formData.image && (
                <p className="text-xs text-green-600 mt-2">File selected: {formData.image.name}</p>
              )}
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <button
            onClick={handlePublish}
            disabled={!formData.title.trim() || !formData.amount.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-2 rounded-md font-medium transition-colors w-full sm:w-auto text-sm"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );

  if (showCreateForm) {
    return (
      <div className="w-full h-full overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Fundings</h1>
            <button
              onClick={handleGoBack}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Create Form */}
        <CreateForm />

        {/* Right Sidebar Icons - Hidden on mobile */}
        <div className="hidden lg:flex fixed right-4 top-1/2 transform -translate-y-1/2 flex-col gap-3 z-40">
          <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
            <Users className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30">
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
      <div className="h-full overflow-y-auto scrollbar-hide pb-24 sm:pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Fundings</h1>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
          
          {/* Tab Navigation - Desktop */}
          <div className="hidden sm:flex gap-1 bg-white rounded-lg p-1 inline-flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Tab Indicator */}
          <div className="sm:hidden bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">{activeTab}</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 sm:hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">Navigation</h3>
              </div>
              <div className="py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <div className="border-t mt-2 pt-2">
                  <button
                    onClick={handleCreateFunding}
                    className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Create New Funding
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border min-h-64 sm:min-h-96">
          {activeTab === 'My Funding Requests' && <EmptyState />}
          {activeTab === 'Browse Funding' && <BrowseFunding />}
        </div>

      </div>
      </div>

      {/* Right Sidebar Icons - Hidden on mobile */}
      <div className="hidden lg:flex fixed right-4 top-1/2 transform -translate-y-1/2 flex-col gap-3 z-40">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <Users className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Bottom Right Sidebar Icon - Hidden on mobile */}
      <div className="hidden lg:block fixed right-4 bottom-20 z-40">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <Users className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={handleCreateFunding}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default FundingsPage;

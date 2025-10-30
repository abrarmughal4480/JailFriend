"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
import React, { useState } from 'react';
import { Plus, Tag, Search, Users, ArrowLeft, Filter, Bell, Menu, X } from 'lucide-react';

const OffersPage = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Offers</h1>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors sm:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search Bar (when expanded) */}
          {showSearch && (
            <div className="mt-3 sm:mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoFocus
                />
                <button 
                  onClick={() => setShowSearch(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
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
              <button 
                onClick={() => {
                  setShowSearch(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Search className="w-5 h-5 text-gray-600" />
                <span>Search Offers</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                <Filter className="w-5 h-5 text-gray-600" />
                <span>Filter Offers</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                <Users className="w-5 h-5 text-gray-600" />
                <span>My Network</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                <Bell className="w-5 h-5 text-gray-600" />
                <span>Notifications</span>
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">0</div>
            <div className="text-xs sm:text-sm text-gray-600">Active Offers</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="text-lg sm:text-2xl font-bold text-green-600">0</div>
            <div className="text-xs sm:text-sm text-gray-600">Saved Offers</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">0</div>
            <div className="text-xs sm:text-sm text-gray-600">Expiring Soon</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">0</div>
            <div className="text-xs sm:text-sm text-gray-600">Used This Month</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
          {['All Offers', 'Food & Dining', 'Shopping', 'Travel', 'Entertainment', 'Services'].map((tab) => (
            <button
              key={tab}
              className="px-3 sm:px-4 py-2 rounded-full whitespace-nowrap text-sm bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 lg:p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Tag className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
            </div>
            
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No offers available</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md">
              We're currently updating our offers. Check back soon for exciting deals and discounts!
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm sm:text-base">
                Browse Categories
              </button>
              <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm sm:text-base">
                Set Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Spacing for FAB */}
        <div className="h-20 sm:h-24"></div>
      </div>

      {/* Desktop Right Sidebar Icons */}
      <div className="hidden lg:flex fixed right-4 xl:right-6 top-1/2 transform -translate-y-1/2 flex-col gap-3 z-40">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all group">
          <Search className="w-5 h-5 text-gray-600 group-hover:text-blue-500" />
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all group">
          <Users className="w-5 h-5 text-gray-600 group-hover:text-green-500" />
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all group">
          <Filter className="w-5 h-5 text-gray-600 group-hover:text-purple-500" />
        </button>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all flex items-center justify-center z-50 group">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Mobile Bottom Navigation Helper */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-safe-area-inset-bottom bg-transparent pointer-events-none"></div>
    </div>
  );
};

export default OffersPage; 

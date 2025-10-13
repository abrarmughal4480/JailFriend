"use client";
import React, { useState } from 'react';
import { Plus, Search, Users, Settings, Menu, X, MapPin } from 'lucide-react';

const FindFriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapZoom, setMapZoom] = useState(4);
  const [showPanel, setShowPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 10));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1));
  };

  const handleSearch = () => {
    console.log('Searching for users:', searchQuery);
  };

  const togglePanel = () => {
    setShowPanel(!showPanel);
  };

  const mockUsers = [
    { id: 1, name: 'Sarah Johnson', location: 'New York, USA', avatar: '👩‍💼', online: true },
    { id: 2, name: 'Miguel Rodriguez', location: 'Barcelona, Spain', avatar: '👨‍💻', online: false },
    { id: 3, name: 'Akira Tanaka', location: 'Tokyo, Japan', avatar: '👨‍🎨', online: true },
    { id: 4, name: 'Emma Wilson', location: 'London, UK', avatar: '👩‍🔬', online: true },
    { id: 5, name: 'Ahmed Hassan', location: 'Cairo, Egypt', avatar: '👨‍⚕️', online: false },
  ];

  const UserCard = ({ user }: { user: any }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xl">{user.avatar}</span>
            </div>
            {user.online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {user.location}
            </p>
          </div>
        </div>
      </div>
      <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
        Add Friend
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gray-100 scrollbar-hide">
      <div className="h-full overflow-y-auto scrollbar-hide">
        <div className="flex flex-col lg:flex-row relative h-full">
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-gray-900">Find Friends</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'map' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              List
            </button>
            <button
              onClick={togglePanel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              {showPanel ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-2.5 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
          />
          <button 
            onClick={handleSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className={`flex-1 relative ${viewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
        <div className="h-full bg-gradient-to-br from-blue-300 to-blue-500 relative overflow-hidden">
          {/* Map Background with simplified continents */}
          <svg 
            className="w-full h-full absolute inset-0" 
            viewBox="0 0 1000 500" 
            style={{ transform: `scale(${1 + mapZoom * 0.1})` }}
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Simple light blue ocean background */}
            <rect width="1000" height="500" fill="#87CEEB" />
            
            {/* North America */}
            <path 
              d="M 50 80 L 120 60 L 180 65 L 230 80 L 280 100 L 320 130 L 340 160 L 330 190 L 310 210 L 280 230 L 240 240 L 200 245 L 160 248 L 120 245 L 90 230 L 70 210 L 50 190 L 40 160 L 45 130 L 50 100 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* South America */}
            <path 
              d="M 220 280 L 270 285 L 290 295 L 300 310 L 310 340 L 315 370 L 310 400 L 300 430 L 285 450 L 270 460 L 250 465 L 230 460 L 215 450 L 205 430 L 200 400 L 205 370 L 210 340 L 215 310 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* Europe */}
            <path 
              d="M 450 90 L 480 85 L 520 90 L 540 100 L 550 120 L 545 140 L 535 155 L 520 160 L 500 165 L 480 160 L 465 150 L 455 135 L 450 120 L 450 105 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* Africa */}
            <path 
              d="M 480 165 L 520 160 L 550 170 L 570 190 L 580 220 L 575 250 L 570 280 L 565 310 L 555 340 L 540 360 L 520 375 L 495 380 L 470 375 L 450 360 L 440 340 L 445 310 L 450 280 L 455 250 L 465 220 L 475 190 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* Asia */}
            <path 
              d="M 550 90 L 600 85 L 650 90 L 700 95 L 750 100 L 800 110 L 830 130 L 840 160 L 835 190 L 820 210 L 800 220 L 770 225 L 740 220 L 710 210 L 680 200 L 650 190 L 620 180 L 590 170 L 570 150 L 555 130 L 550 110 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* Australia */}
            <path 
              d="M 720 330 L 780 325 L 820 335 L 840 350 L 845 365 L 840 380 L 825 390 L 800 395 L 770 390 L 745 385 L 725 375 L 715 360 L 715 345 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* Simple white clouds */}
            <ellipse cx="150" cy="130" rx="25" ry="10" fill="white" opacity="0.8" />
            <ellipse cx="170" cy="125" rx="20" ry="8" fill="white" opacity="0.8" />
            <ellipse cx="185" cy="130" rx="15" ry="6" fill="white" opacity="0.8" />
            
            <ellipse cx="650" cy="160" rx="30" ry="12" fill="white" opacity="0.7" />
            <ellipse cx="675" cy="155" rx="25" ry="10" fill="white" opacity="0.7" />
            <ellipse cx="695" cy="160" rx="20" ry="8" fill="white" opacity="0.7" />
            
            {/* User markers */}
            <circle cx="180" cy="120" r="8" fill="#EF4444" className="animate-pulse" />
            <circle cx="520" cy="130" r="8" fill="#10B981" className="animate-pulse" />
            <circle cx="720" cy="180" r="8" fill="#3B82F6" className="animate-pulse" />
            <circle cx="500" cy="145" r="8" fill="#F59E0B" className="animate-pulse" />
            <circle cx="540" cy="200" r="8" fill="#8B5CF6" className="animate-pulse" />
          </svg>
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <button 
              onClick={handleZoomIn}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-md shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            >
              <span className="text-gray-700 font-bold text-sm sm:text-lg">+</span>
            </button>
            <button 
              onClick={handleZoomOut}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-md shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            >
              <span className="text-gray-700 font-bold text-sm sm:text-lg">−</span>
            </button>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 hidden sm:block">
            <div className="text-xs font-medium text-gray-700 mb-2">Active Users</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>5 users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Desktop */}
      <div className={`hidden lg:flex w-80 xl:w-96 bg-white shadow-lg flex-col`}>
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Find friends</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
            <button 
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {mockUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
          
          {/* Load More */}
          <div className="mt-6 text-center">
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
              Load more users
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Panel */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
        showPanel ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={togglePanel}></div>
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl transform transition-transform duration-300 ${
          showPanel ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <div className="p-4 border-b">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-900">Nearby Users</h2>
          </div>
          <div className="max-h-96 overflow-y-auto p-4">
            <div className="space-y-4">
              {mockUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile List View */}
      <div className={`lg:hidden flex-1 bg-white ${viewMode === 'map' ? 'hidden' : 'block'}`}>
        <div className="p-4 space-y-4 overflow-y-auto h-full">
          {mockUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
          
          {/* Load More */}
          <div className="mt-6 text-center">
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
              Load more users
            </button>
          </div>
        </div>
      </div>

      {/* Empty State for No Results */}
      {mockUsers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mx-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-gray-600 font-medium">No users to show</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
        }
        
        /* Completely fixed page - no scrolling */
        body {
          overflow: hidden;
          margin: 0;
          padding: 0;
          height: 100vh;
          width: 100vw;
        }
        
        html {
          overflow: hidden;
          height: 100vh;
          width: 100vw;
        }
        
        /* Ensure content doesn't overflow */
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default FindFriendsPage;

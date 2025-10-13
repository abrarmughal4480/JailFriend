"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState } from 'react';
import { MapPin, Grid3X3, Search, Briefcase, Plus, Filter, X, Clock, DollarSign, Building, Star } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedTime: string;
  featured: boolean;
  logo: string;
  tags: string[];
}

const JobsPage = () => {
  const [selectedJobType, setSelectedJobType] = useState('Part time');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'jobs' | 'nearby'>('jobs');

  const jobTypes = [
    'Full time',
    'Part time', 
    'Internship',
    'Volunteer',
    'Contract'
  ];

  // Mock jobs data
  const mockJobs: Job[] = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'Remote',
      type: 'Full time',
      salary: '$60,000 - $80,000',
      description: 'We are looking for a skilled Frontend Developer to join our team and help build amazing user experiences.',
      postedTime: '2 hours ago',
      featured: true,
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
      tags: ['React', 'JavaScript', 'CSS']
    },
    {
      id: 2,
      title: 'Marketing Intern',
      company: 'StartupXYZ',
      location: 'New York, NY',
      type: 'Internship',
      salary: '$15/hour',
      description: 'Join our dynamic marketing team and gain hands-on experience in digital marketing strategies.',
      postedTime: '5 hours ago',
      featured: false,
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
      tags: ['Marketing', 'Social Media', 'Analytics']
    },
    {
      id: 3,
      title: 'Part-time Sales Associate',
      company: 'Retail Plus',
      location: 'Los Angeles, CA',
      type: 'Part time',
      salary: '$18/hour',
      description: 'Customer-focused sales position with flexible hours. Perfect for students or career changers.',
      postedTime: '1 day ago',
      featured: false,
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
      tags: ['Sales', 'Customer Service', 'Retail']
    },
    {
      id: 4,
      title: 'Volunteer Coordinator',
      company: 'Community Aid',
      location: 'Chicago, IL',
      type: 'Volunteer',
      salary: 'Volunteer',
      description: 'Help coordinate volunteer activities and make a difference in your community.',
      postedTime: '3 days ago',
      featured: false,
      logo: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&h=100&fit=crop',
      tags: ['Non-profit', 'Community', 'Organization']
    }
  ];

  const handleExploreNearby = () => {
    console.log('Exploring nearby businesses...');
    setViewMode('nearby');
  };

  const handleSearch = () => {
    console.log('Searching jobs...', { searchQuery, location, category, selectedJobType });
  };

  const getFilteredJobs = () => {
    return mockJobs.filter(job => 
      job.type === selectedJobType &&
      (searchQuery === '' || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       job.company.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (location === '' || job.location.toLowerCase().includes(location.toLowerCase()))
    );
  };

  // Job Card Component
  const JobCard: React.FC<{ job: Job }> = ({ job }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          <img 
            src={job.logo} 
            alt={job.company}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
          />
        </div>
        
        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{job.title}</h3>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Building className="w-4 h-4" />
                <span>{job.company}</span>
              </div>
            </div>
            {job.featured && (
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium self-start">
                Featured
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{job.postedTime}</span>
            </div>
          </div>
          
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">{job.description}</p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
              Apply Now
            </button>
            <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Save Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Nearby Businesses Component
  const NearbyBusinesses = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Nearby Businesses</h2>
        <button 
          onClick={() => setViewMode('jobs')}
          className="text-blue-600 text-sm hover:text-blue-700"
        >
          Back to Jobs
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="w-full h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-3 flex items-center justify-center">
              <Building className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Local Business {item}</h3>
            <p className="text-gray-600 text-sm mb-2">1.{item} km away</p>
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600">4.{item}</span>
            </div>
            <button className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        
        {/* Nearby Business Banner */}
        <div className="bg-gradient-to-r from-green-200 to-green-300 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                Nearby Business
              </h2>
              <p className="text-gray-700 text-sm sm:text-base mb-4 max-w-md">
                Find businesses near to you based on your location and connect with them directly.
              </p>
              <button 
                onClick={handleExploreNearby}
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition-colors text-sm"
              >
                Explore
              </button>
            </div>
            
            {/* Business Illustration - Hidden on mobile */}
            <div className="hidden md:block">
              <div className="w-32 h-24 relative">
                <div className="absolute right-0 top-0">
                  <svg width="120" height="90" viewBox="0 0 120 90" className="text-gray-600">
                    <circle cx="20" cy="25" r="8" fill="currentColor" opacity="0.7"/>
                    <rect x="15" y="35" width="10" height="20" fill="currentColor" opacity="0.7"/>
                    <circle cx="45" cy="20" r="8" fill="currentColor" opacity="0.8"/>
                    <rect x="40" y="30" width="10" height="25" fill="currentColor" opacity="0.8"/>
                    <circle cx="70" cy="25" r="8" fill="currentColor" opacity="0.7"/>
                    <rect x="65" y="35" width="10" height="20" fill="currentColor" opacity="0.7"/>
                    <rect x="10" y="55" width="70" height="4" fill="currentColor" opacity="0.6"/>
                    <rect x="12" y="59" width="8" height="15" fill="currentColor" opacity="0.5"/>
                    <rect x="70" y="59" width="8" height="15" fill="currentColor" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        {viewMode === 'jobs' ? (
          <div className="bg-white rounded-lg shadow-sm border">
            
            {/* Header */}
            <div className="p-4 sm:p-6 border-b">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Jobs</h1>
                
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
              
              {/* Desktop Search Filters */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                
                {/* Location Filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-blue-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-600"
                  />
                </div>

                {/* Categories Filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Grid3X3 className="h-4 w-4 text-blue-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Categories"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-600"
                  />
                </div>

                {/* Search Jobs */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for jobs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Mobile Search - Always Visible */}
              <div className="md:hidden mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for jobs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Mobile Filters Panel */}
              {showFilters && (
                <div className="md:hidden bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-blue-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-600 text-sm"
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Grid3X3 className="h-4 w-4 text-blue-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Categories"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-600 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Job Type Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedJobType(type)}
                    className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      selectedJobType === type
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Jobs Content */}
            <div className="p-4 sm:p-6">
              {getFilteredJobs().length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {getFilteredJobs().map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                  
                  {/* Load More */}
                  <div className="text-center pt-4">
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                      Load more jobs
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                  </div>
                  <p className="text-gray-600 text-center font-medium text-sm sm:text-base">
                    No available jobs to show.
                  </p>
                  <p className="text-gray-500 text-center text-xs sm:text-sm mt-1">
                    Try adjusting your search criteria or job type.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Nearby Businesses View */
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <NearbyBusinesses />
          </div>
        )}

      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default JobsPage;

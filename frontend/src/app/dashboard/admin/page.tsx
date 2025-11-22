"use client";
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../utils/adminApi';
import { useDarkMode } from '@/contexts/DarkModeContext';

const AdminDashboard = () => {
  const { isDarkMode } = useDarkMode();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalPages: 0,
    totalGroups: 0,
    totalGames: 0,
    totalMessages: 0,
    onlineUsers: 0,
    totalComments: 0
  });
  const [chartData, setChartData] = useState<Array<{month: number, posts: number, users: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardStats();
      
      if (data.success) {
        setStats(data.stats);
        setChartData(data.chartData);
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "TOTAL USERS",
      value: stats.totalUsers.toLocaleString(),
      icon: "👥",
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "TOTAL POSTS",
      value: stats.totalPosts.toLocaleString(),
      icon: "📝",
      color: "bg-sky-500",
      textColor: "text-sky-600"
    },
    {
      title: "TOTAL PAGES",
      value: stats.totalPages.toLocaleString(),
      icon: "🏷️",
      color: "bg-yellow-500",
      textColor: "text-yellow-600"
    },
    {
      title: "TOTAL GROUPS",
      value: stats.totalGroups.toLocaleString(),
      icon: "👨‍👩‍👧‍👦",
      color: "bg-pink-500",
      textColor: "text-pink-600"
    },
    {
      title: "ONLINE USERS",
      value: stats.onlineUsers.toLocaleString(),
      icon: "🟢",
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "TOTAL COMMENTS",
      value: stats.totalComments.toLocaleString(),
      icon: "💬",
      color: "bg-purple-500",
      textColor: "text-purple-600"
    },
    {
      title: "TOTAL GAMES",
      value: stats.totalGames.toLocaleString(),
      icon: "🎮",
      color: "bg-sky-500",
      textColor: "text-sky-600"
    },
    {
      title: "TOTAL MESSAGES",
      value: stats.totalMessages.toLocaleString(),
      icon: "💬",
      color: "bg-yellow-500",
      textColor: "text-yellow-600"
    }
  ];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getMaxValue = () => {
    const maxPosts = Math.max(...chartData.map(item => item.posts));
    const maxUsers = Math.max(...chartData.map(item => item.users));
    return Math.max(maxPosts, maxUsers, 5000); // Minimum 5000 for better visualization
  };

  const getBarHeight = (value: number, maxValue: number) => {
    return (value / maxValue) * 240; // Max height 240px
  };

  if (loading) {
    return (
      <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-100 border-red-200'} border rounded-lg p-4`}>
          <div className="flex items-center gap-2">
            <span className={`text-red-500 ${isDarkMode ? 'text-red-400' : ''} text-lg`}>⚠️</span>
            <span className={`${isDarkMode ? 'text-red-400' : 'text-red-700'} font-medium`}>
              Error: {error}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
          Welcome back, Admin
        </h1>
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Home {'>'} <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-semibold`}>DASHBOARD</span>
        </div>
      </div>

      {/* System Alert */}
      <div className={`${isDarkMode ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-100 border-pink-200'} border rounded-lg p-4 mb-6`}>
        <div className="flex items-center gap-2">
          <span className={`text-red-500 ${isDarkMode ? 'text-red-400' : ''} text-lg`}>⚠️</span>
          <span className={`${isDarkMode ? 'text-red-400' : 'text-red-700'} font-medium`}>
            Important! There are some errors found on your system, please review System Status.
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : stat.textColor}`}>
                {stat.value}
              </div>
            </div>
            <h3 className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium text-sm`}>
              {stat.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Statistics Chart Section */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>STATISTICS</h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This Year</span>
            <div className={`w-3 h-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded`}></div>
          </div>
        </div>
        
        {/* Chart */}
        <div className={`h-64 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
          {/* Y-axis labels */}
          <div className="flex h-full">
            <div className={`flex flex-col justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-2 w-8`}>
              <span>{getMaxValue().toLocaleString()}</span>
              <span>{Math.round(getMaxValue() * 0.8).toLocaleString()}</span>
              <span>{Math.round(getMaxValue() * 0.6).toLocaleString()}</span>
              <span>{Math.round(getMaxValue() * 0.4).toLocaleString()}</span>
              <span>{Math.round(getMaxValue() * 0.2).toLocaleString()}</span>
              <span>0</span>
            </div>
            
            {/* Chart bars */}
            <div className="flex-1 flex items-end justify-between gap-1">
              {chartData.map((monthData, index) => {
                const maxValue = getMaxValue();
                const usersHeight = getBarHeight(monthData.users, maxValue);
                const postsHeight = getBarHeight(monthData.posts, maxValue);
                
                return (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div 
                      className="w-8 bg-green-500 rounded-t" 
                      style={{height: `${usersHeight}px`}}
                    ></div>
                    <div 
                      className="w-8 bg-red-500 rounded-t" 
                      style={{height: `${postsHeight}px`}}
                    ></div>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{monthNames[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Pages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded"></div>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Groups</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 

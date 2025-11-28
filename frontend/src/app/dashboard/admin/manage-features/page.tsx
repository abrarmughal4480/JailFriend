"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/contexts/DarkModeContext';

const AdminManageFeatures = () => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  
  const featuresItems = [
    { name: "Enable / Disable Features", icon: "🔧", description: "Control which features are active on the platform", href: "/dashboard/admin/manage-features/enable-disable" },
    { name: "Applications", icon: "📱", description: "Manage mobile and web applications", href: "/dashboard/admin/manage-features/applications" },
    { name: "Pages", icon: "📄", description: "Configure page settings and permissions", href: "/dashboard/admin/manage-features/pages" },
    { name: "Groups", icon: "👥", description: "Manage group features and settings", href: "/dashboard/admin/manage-features/groups" },
    { name: "Posts", icon: "📝", description: "Configure post creation and sharing features", href: "/dashboard/admin/manage-features/posts" },
    { name: "Fundings", icon: "💰", description: "Manage funding and donation features", href: "/dashboard/admin/manage-features/fundings" },
    { name: "Jobs", icon: "💼", description: "Configure job posting and application features", href: "/dashboard/admin/manage-features/jobs" },
    { name: "Offers", icon: "🎁", description: "Manage promotional offers and deals", href: "/dashboard/admin/manage-features/offers" },
    { name: "Articles (Blog)", icon: "📰", description: "Configure blog and article features", href: "/dashboard/admin/manage-features/articles" },
    { name: "Events", icon: "📅", description: "Manage event creation and management", href: "/dashboard/admin/manage-features/events" },
    { name: "Content Monetization", icon: "💳", description: "Configure content monetization features", href: "/dashboard/admin/manage-features/monetization" },
    { name: "Store Settings", icon: "🏪", description: "Configure store settings and preferences", href: "/dashboard/admin/manage-features/store/settings" },
    { name: "Manage Products", icon: "📦", description: "Manage store products and inventory", href: "/dashboard/admin/manage-features/store/products" },
    { name: "Manage Orders", icon: "🛒", description: "View and manage customer orders", href: "/dashboard/admin/manage-features/store/orders" },
    { name: "Manage Reviews", icon: "⭐", description: "Manage product reviews and ratings", href: "/dashboard/admin/manage-features/store/reviews" },
    { name: "Manage Forums Sections", icon: "📋", description: "Manage forum sections and categories", href: "/dashboard/admin/manage-features/forums/sections" },
    { name: "Manage Forums", icon: "💬", description: "Manage forums and discussions", href: "/dashboard/admin/manage-features/forums/manage" },
    { name: "Manage Threads", icon: "🧵", description: "Manage forum threads and topics", href: "/dashboard/admin/manage-features/forums/threads" },
    { name: "Manage Replies", icon: "💭", description: "Manage forum replies and comments", href: "/dashboard/admin/manage-features/forums/replies" },
    { name: "Create New Section", icon: "➕", description: "Create a new forum section", href: "/dashboard/admin/manage-features/forums/create-section" },
    { name: "Create New Forum", icon: "✨", description: "Create a new forum", href: "/dashboard/admin/manage-features/forums/create-forum" },
    { name: "Manage Movies", icon: "🎬", description: "Manage movies and video content", href: "/dashboard/admin/manage-features/movies/manage" },
    { name: "Add New Movie", icon: "🎥", description: "Add a new movie to the platform", href: "/dashboard/admin/manage-features/movies/add" },
    { name: "Manage Games", icon: "🎮", description: "Manage games and gaming content", href: "/dashboard/admin/manage-features/games/manage" },
    { name: "Add New Game", icon: "🕹️", description: "Add a new game to the platform", href: "/dashboard/admin/manage-features/games/add" },
    { name: "Pages Categories", icon: "📑", description: "Manage page categories", href: "/dashboard/admin/manage-features/categories/pages" },
    { name: "Pages Sub Categories", icon: "📑", description: "Manage page sub categories", href: "/dashboard/admin/manage-features/categories/pages-sub" },
    { name: "Groups Categories", icon: "👥", description: "Manage group categories", href: "/dashboard/admin/manage-features/categories/groups" },
    { name: "Groups Sub Categories", icon: "👥", description: "Manage group sub categories", href: "/dashboard/admin/manage-features/categories/groups-sub" },
    { name: "Blogs Categories", icon: "📝", description: "Manage blog categories", href: "/dashboard/admin/manage-features/categories/blogs" },
    { name: "Products Categories", icon: "📦", description: "Manage product categories", href: "/dashboard/admin/manage-features/categories/products" },
    { name: "Products Sub Categories", icon: "📦", description: "Manage product sub categories", href: "/dashboard/admin/manage-features/categories/products-sub" },
    { name: "Job Categories", icon: "💼", description: "Manage job categories", href: "/dashboard/admin/manage-features/categories/jobs" },
    { name: "Custom Users Fields", icon: "👤", description: "Manage custom fields for users", href: "/dashboard/admin/manage-features/custom-fields/users" },
    { name: "Custom Pages Fields", icon: "📄", description: "Manage custom fields for pages", href: "/dashboard/admin/manage-features/custom-fields/pages" },
    { name: "Custom Groups Fields", icon: "👥", description: "Manage custom fields for groups", href: "/dashboard/admin/manage-features/custom-fields/groups" },
    { name: "Custom Products Fields", icon: "📦", description: "Manage custom fields for products", href: "/dashboard/admin/manage-features/custom-fields/products" }
  ];

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
          Feature Management
        </h1>
        <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Home {'>'} Admin {'>'} <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-semibold`}>MANAGE FEATURES</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {featuresItems.map((item, index) => (
          <div 
            key={index} 
            onClick={() => item.href && router.push(item.href)}
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:shadow-lg' : 'bg-white border-gray-200 hover:shadow-md'} rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6 transition-shadow cursor-pointer`}
          >
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} rounded-lg flex items-center justify-center text-lg sm:text-xl lg:text-2xl`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm sm:text-base lg:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} truncate`}>{item.name}</h3>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>{item.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.href) router.push(item.href);
                }}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 ${isDarkMode ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors text-xs sm:text-sm`}
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageFeatures; 

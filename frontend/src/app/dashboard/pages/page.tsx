"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, ArrowLeft, ArrowRight, ThumbsUp, Camera, Users, Menu, X, Search, Heart, MessageCircle, Share2, Globe, Calendar, Users2, Star, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

// Helper function to get proper image URL
const getImageUrl = (url: string) => {
  if (!url) return '/default-avatar.svg';
  if (url.startsWith('http')) return url;

  // Handle localhost URLs that might be stored incorrectly
  if (url.includes('localhost:3000')) {
    return url.replace('http://localhost:3000', API_URL);
  }

  // Handle hardcoded placeholder avatars that don't exist
  if (url.includes('/avatars/') || url.includes('/covers/')) {
    return '/default-avatar.svg';
  }

  return `${API_URL}/${url}`;
};

interface Tab {
  name: string;
  active: boolean;
}

interface FormData {
  pageName: string;
  pageURL: string;
  pageDescription: string;
  pageCategory: string;
}

interface Page {
  _id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  createdBy: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  creatorName: string;
  creatorAvatar: string;
  likes: string[];
  followers: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface SuggestedPage {
  id: number;
  name: string;
  likes: number;
  category: string;
  icon: string;
  color: string;
}

interface MyPagesComponentProps {
  loading: boolean;
  userPages: Page[];
  onCreate: () => void;
  onOpenPage: (id: string) => void;
  onEdit: (page: Page) => void;
  onDelete: (pageId: string) => void;
  onLike: (pageId: string) => void;
  onJoin: (pageId: string) => void;
}

interface CreatePageFormProps {
  formData: FormData;
  categories: string[];
  categoriesLoading: boolean;
  creating: boolean;
  isFormValid: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCreate: () => void;
  onGoBack: () => void;
}

interface SuggestedPagesComponentProps {
  suggestedPages: SuggestedPage[];
  onLike: (id: number) => void;
}

// Top-level components to prevent remount on each parent render
const MyPagesView: React.FC<MyPagesComponentProps> = ({ loading, userPages, onCreate, onOpenPage, onEdit, onDelete, onLike, onJoin }) => {
  const { isDarkMode } = useDarkMode();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const isLiked = (page: Page) => {
    return page.likes && Array.isArray(page.likes) &&
      (page.likes.includes(currentUser._id) || page.likes.includes(currentUser.id));
  };

  const isJoined = (page: Page) => {
    return page.followers && Array.isArray(page.followers) &&
      (page.followers.includes(currentUser._id) || page.followers.includes(currentUser.id));
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border min-h-80 flex flex-col items-center justify-center p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className={`text-lg font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
          }`}>Loading your pages...</p>
      </div>
    );
  }

  if (userPages.length === 0) {
    return (
      <div className={`rounded-2xl border min-h-80 flex flex-col items-center justify-center p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-200 ${isDarkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
          }`}>
          <FileText className={`w-10 h-10 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
        </div>
        <h3 className={`text-xl font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>No pages yet</h3>
        <p className={`text-center mb-8 max-w-md transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
          }`}>
          Create your first page to start building your online presence and connect with your audience.
        </p>
        <button
          onClick={onCreate}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Create New Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Your Pages</h3>
          <p className={`mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>{userPages.length} page{userPages.length !== 1 ? 's' : ''} • Click any page to open it</p>
        </div>
        <button
          onClick={onCreate}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {userPages.map((page) => {
          const isCreator = page.createdBy?._id === currentUser._id || page.createdBy?._id === currentUser.id;

          return (
            <div
              key={page._id}
              onClick={() => onOpenPage(page._id)}
              className={`rounded-2xl border overflow-hidden transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer relative ${isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:shadow-xl hover:border-blue-500'
                : 'bg-white border-gray-100 hover:shadow-xl hover:border-blue-200'
                }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isDarkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
                    }`}>
                    <FileText className={`w-7 h-7 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-bold text-lg truncate transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{page.name}</h4>
                      {page.isVerified && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">@{page.url}</span>
                    </div>
                  </div>
                </div>

                <p className={`text-base mb-4 leading-relaxed line-clamp-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>{page.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-200 ${isDarkMode
                    ? 'bg-gray-700 text-gray-300 border-gray-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                    {page.category}
                  </span>
                  <div className={`flex items-center gap-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date(page.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={`flex items-center justify-between pt-4 border-t transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}>
                  <div className={`flex items-center gap-6 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="font-medium">{page.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">{page.followers?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCreator && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === page._id ? null : page._id);
                          }}
                          className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            } ${openDropdownId === page._id ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                          title="More options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {openDropdownId === page._id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(null);
                              }}
                            />
                            <div
                              className={`absolute right-0 bottom-full mb-2 w-40 rounded-lg shadow-lg border z-20 ${isDarkMode
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'
                                }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  onEdit(page);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-t-lg transition-colors duration-200 ${isDarkMode
                                  ? 'hover:bg-gray-700 text-gray-300'
                                  : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                              >
                                <Edit className="w-4 h-4" />
                                <span className="text-sm font-medium">Edit</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  if (confirm('Are you sure you want to delete this page?')) {
                                    onDelete(page._id);
                                  }
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-b-lg transition-colors duration-200 ${isDarkMode
                                  ? 'hover:bg-gray-700 text-red-400'
                                  : 'hover:bg-gray-50 text-red-600'
                                  }`}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(page._id);
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${isLiked(page)
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                      title={isLiked(page) ? "Unlike Page" : "Like Page"}
                    >
                      <Heart className={`w-4 h-4 ${isLiked(page) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoin(page._id);
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${isJoined(page)
                        ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      title={isJoined(page) ? "Unfollow Page" : "Follow Page"}
                    >
                      <Users2 className={`w-4 h-4 ${isJoined(page) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode
                        ? 'text-gray-400 hover:text-green-400 hover:bg-gray-700'
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                      title="Share Page"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <div className={`w-6 h-6 group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EditPageFormView: React.FC<CreatePageFormProps & { updating: boolean }> = ({ formData, categories, categoriesLoading, creating, isFormValid, onInputChange, onCreate, onGoBack, updating }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`rounded-2xl border p-8 max-w-3xl mx-auto shadow-lg transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
      {/* Form Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
            <Edit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Edit Page</h2>
            <p className={`mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>Update your page information</p>
          </div>
        </div>
        <button
          onClick={onGoBack}
          className={`sm:hidden p-3 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
        >
          <X className={`w-6 h-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
        {/* Page Name */}
        <div>
          <label className={`block text-sm font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Page Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="pageName"
            value={formData.pageName}
            onChange={onInputChange}
            placeholder="Enter your page name"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${formData.pageName.length > 0
              ? formData.pageName.length >= 3
                ? isDarkMode
                  ? 'border-green-500 bg-green-900/20 text-white'
                  : 'border-green-300 bg-green-50'
                : isDarkMode
                  ? 'border-red-500 bg-red-900/20 text-white'
                  : 'border-red-300 bg-red-50'
              : isDarkMode
                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          />
          {formData.pageName.length > 0 && (
            <div className={`text-sm mt-2 transition-colors duration-200 ${formData.pageName.length >= 3
              ? isDarkMode ? 'text-green-400' : 'text-green-600'
              : 'text-red-500'
              }`}>
              {formData.pageName.length >= 3
                ? '✓ Page name is valid'
                : `Page name must be at least 3 characters (${formData.pageName.length}/3)`
              }
            </div>
          )}
        </div>

        {/* Page URL */}
        <div>
          <label className={`block text-sm font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Page URL <span className="text-red-500">*</span></label>
          <div className="flex">
            <span className={`inline-flex items-center px-4 py-4 rounded-l-xl border border-r-0 text-sm font-medium transition-colors duration-200 ${isDarkMode
              ? 'border-gray-600 bg-gray-700 text-gray-300'
              : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}>
              https://jaifriend.com/
            </span>
            <input
              type="text"
              name="pageURL"
              value={formData.pageURL}
              onChange={onInputChange}
              placeholder="your-page-url"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-lpignore="true"
              data-form-type="other"
              className={`flex-1 p-4 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${formData.pageURL.length > 0
                ? formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
                  ? isDarkMode
                    ? 'border-green-500 bg-green-900/20 text-white'
                    : 'border-green-300 bg-green-50'
                  : isDarkMode
                    ? 'border-red-500 bg-red-900/20 text-white'
                    : 'border-red-300 bg-red-50'
                : isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            />
          </div>
          {formData.pageURL.length > 0 && (
            <div className={`text-sm mt-2 transition-colors duration-200 ${formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
              ? isDarkMode ? 'text-green-400' : 'text-green-600'
              : 'text-red-500'
              }`}>
              {formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
                ? '✓ URL is valid'
                : formData.pageURL.length < 3
                  ? `URL must be at least 3 characters (${formData.pageURL.length}/3)`
                  : 'URL can only contain lowercase letters, numbers, and hyphens'
              }
            </div>
          )}
        </div>

        {/* Page Description */}
        <div>
          <label className={`block text-sm font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Page Description <span className="text-red-500">*</span></label>
          <textarea
            name="pageDescription"
            value={formData.pageDescription}
            onChange={onInputChange}
            rows={4}
            placeholder="Describe what your page is about..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base transition-all duration-200 ${formData.pageDescription.length > 0
              ? formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
                ? isDarkMode
                  ? 'border-green-500 bg-green-900/20 text-white'
                  : 'border-green-300 bg-green-50'
                : isDarkMode
                  ? 'border-red-500 bg-red-900/20 text-white'
                  : 'border-red-300 bg-red-50'
              : isDarkMode
                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          />
          <div className="flex items-center justify-between mt-2">
            <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
              Between 10 and 200 characters
            </p>
            <span className={`text-sm font-medium transition-colors duration-200 ${formData.pageDescription.length > 200 ? 'text-red-500' :
              formData.pageDescription.length >= 10 ? isDarkMode ? 'text-green-400' : 'text-green-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
              {formData.pageDescription.length}/200
            </span>
          </div>
          {formData.pageDescription.length > 0 && (
            <div className={`text-sm mt-2 transition-colors duration-200 ${formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
              ? isDarkMode ? 'text-green-400' : 'text-green-600'
              : 'text-red-500'
              }`}>
              {formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
                ? '✓ Description is valid'
                : formData.pageDescription.length < 10
                  ? `Description must be at least 10 characters (${formData.pageDescription.length}/10)`
                  : 'Description must be less than 200 characters'
              }
            </div>
          )}
        </div>

        {/* Page Category */}
        <div>
          <label className={`block text-sm font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Page Category <span className="text-red-500">*</span></label>
          <select
            name="pageCategory"
            value={formData.pageCategory}
            onChange={onInputChange}
            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            {categoriesLoading ? (
              <option value="">Loading categories...</option>
            ) : categories.length === 0 ? (
              <option value="">No category available</option>
            ) : (
              <>
                <option value="">Select a category</option>
                {categories.map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </>
            )}
          </select>
          <p className={`text-sm mt-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
            Choose the category that best describes your page
          </p>
        </div>

        {/* Form Actions */}
        <div className={`flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-6 border-t transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
          <button
            onClick={onGoBack}
            disabled={updating}
            className={`hidden sm:flex items-center gap-2 transition-colors disabled:opacity-50 px-6 py-3 rounded-xl ${isDarkMode
              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Go back
          </button>
          <button
            onClick={onCreate}
            disabled={updating || !isFormValid}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            {updating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating Page...
              </>
            ) : (
              <>
                <Edit className="w-5 h-5" />
                Update Page
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const CreatePageFormView: React.FC<CreatePageFormProps> = ({ formData, categories, categoriesLoading, creating, isFormValid, onInputChange, onCreate, onGoBack }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`rounded-2xl border p-8 max-w-3xl mx-auto shadow-lg transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
      {/* Form Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Create New Page</h2>
            <p className={`mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>Build your online presence</p>
          </div>
        </div>
        <button
          onClick={onGoBack}
          className={`sm:hidden p-3 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
        >
          <X className={`w-6 h-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
        {/* Page Name */}
        <div>
          <label className={`block text-sm font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Page Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="pageName"
            value={formData.pageName}
            onChange={onInputChange}
            placeholder="Enter your page name"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${formData.pageName.length > 0
              ? formData.pageName.length >= 3
                ? isDarkMode
                  ? 'border-green-500 bg-green-900/20 text-white'
                  : 'border-green-300 bg-green-50'
                : isDarkMode
                  ? 'border-red-500 bg-red-900/20 text-white'
                  : 'border-red-300 bg-red-50'
              : isDarkMode
                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          />
          {formData.pageName.length > 0 && (
            <div className={`text-sm mt-2 transition-colors duration-200 ${formData.pageName.length >= 3
              ? isDarkMode ? 'text-green-400' : 'text-green-600'
              : 'text-red-500'
              }`}>
              {formData.pageName.length >= 3
                ? '✓ Page name is valid'
                : `Page name must be at least 3 characters (${formData.pageName.length}/3)`
              }
            </div>
          )}
        </div>

        {/* Page URL */}
        <div>
          <label className={`block text-sm font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Page URL <span className="text-red-500">*</span></label>
          <div className="flex">
            <span className={`inline-flex items-center px-4 py-4 rounded-l-xl border border-r-0 text-sm font-medium transition-colors duration-200 ${isDarkMode
              ? 'border-gray-600 bg-gray-700 text-gray-300'
              : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}>
              https://jaifriend.com/
            </span>
            <input
              type="text"
              name="pageURL"
              value={formData.pageURL}
              onChange={onInputChange}
              placeholder="your-page-url"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-lpignore="true"
              data-form-type="other"
              className={`flex-1 p-4 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${formData.pageURL.length > 0
                ? formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
                  ? isDarkMode
                    ? 'border-green-500 bg-green-900/20 text-white'
                    : 'border-green-300 bg-green-50'
                  : isDarkMode
                    ? 'border-red-500 bg-red-900/20 text-white'
                    : 'border-red-300 bg-red-50'
                : isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            />
          </div>
          {formData.pageURL.length > 0 && (
            <div className={`text-sm mt-2 transition-colors duration-200 ${formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
              ? isDarkMode ? 'text-green-400' : 'text-green-600'
              : 'text-red-500'
              }`}>
              {formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
                ? '✓ URL is valid'
                : formData.pageURL.length < 3
                  ? `URL must be at least 3 characters (${formData.pageURL.length}/3)`
                  : 'URL can only contain lowercase letters, numbers, and hyphens'
              }
            </div>
          )}
        </div>

        {/* Page Description */}
        <div>
          <label className={`block text-sm font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Page Description <span className="text-red-500">*</span></label>
          <textarea
            name="pageDescription"
            value={formData.pageDescription}
            onChange={onInputChange}
            rows={4}
            placeholder="Describe what your page is about..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base transition-all duration-200 ${formData.pageDescription.length > 0
              ? formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
                ? isDarkMode
                  ? 'border-green-500 bg-green-900/20 text-white'
                  : 'border-green-300 bg-green-50'
                : isDarkMode
                  ? 'border-red-500 bg-red-900/20 text-white'
                  : 'border-red-300 bg-red-50'
              : isDarkMode
                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          />
          <div className="flex items-center justify-between mt-2">
            <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
              Between 10 and 200 characters
            </p>
            <span className={`text-sm font-medium transition-colors duration-200 ${formData.pageDescription.length > 200 ? 'text-red-500' :
              formData.pageDescription.length >= 10 ? isDarkMode ? 'text-green-400' : 'text-green-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
              {formData.pageDescription.length}/200
            </span>
          </div>
          {formData.pageDescription.length > 0 && (
            <div className={`text-sm mt-2 transition-colors duration-200 ${formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
              ? isDarkMode ? 'text-green-400' : 'text-green-600'
              : 'text-red-500'
              }`}>
              {formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
                ? '✓ Description is valid'
                : formData.pageDescription.length < 10
                  ? `Description must be at least 10 characters (${formData.pageDescription.length}/10)`
                  : 'Description must be less than 200 characters'
              }
            </div>
          )}
        </div>

        {/* Page Category */}
        <div>
          <label className={`block text-sm font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Page Category <span className="text-red-500">*</span></label>
          <select
            name="pageCategory"
            value={formData.pageCategory}
            onChange={onInputChange}
            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            {categoriesLoading ? (
              <option value="">Loading categories...</option>
            ) : categories.length === 0 ? (
              <option value="">No category available</option>
            ) : (
              <>
                <option value="">Select a category</option>
                {categories.map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </>
            )}
          </select>
          <p className={`text-sm mt-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
            Choose the category that best describes your page
          </p>
        </div>

        {/* Form Actions */}
        <div className={`flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-6 border-t transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
          <button
            onClick={onGoBack}
            disabled={creating}
            className={`hidden sm:flex items-center gap-2 transition-colors disabled:opacity-50 px-6 py-3 rounded-xl ${isDarkMode
              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Go back
          </button>
          <button
            onClick={onCreate}
            disabled={creating || !isFormValid}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            {creating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Page...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Page
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const SuggestedPagesView: React.FC<{
  promotedPages: Page[],
  otherPages: Page[],
  onLike: (pageId: string) => void,
  onJoin: (pageId: string) => void,
  loading: boolean
}> = ({ promotedPages, otherPages, onLike, onJoin, loading }) => {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const isLiked = (page: Page) => {
    return page.likes && Array.isArray(page.likes) &&
      (page.likes.includes(currentUser._id) || page.likes.includes(currentUser.id));
  };

  const isJoined = (page: Page) => {
    return page.followers && Array.isArray(page.followers) &&
      (page.followers.includes(currentUser._id) || page.followers.includes(currentUser.id));
  };

  return (
    <div className="space-y-8">
      {/* Promoted Section */}
      <div>
        <h3 className={`text-xl font-bold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Promoted Pages</h3>
        {loading ? (
          <div className={`rounded-2xl border min-h-32 flex flex-col items-center justify-center p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`text-lg font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>Loading promoted pages...</p>
          </div>
        ) : promotedPages.length > 0 ? (
          <div className="space-y-4">
            {promotedPages.map((page: Page) => (
              <div
                key={page._id}
                onClick={() => {
                  // Navigate to page details or open page
                  router.push(`/dashboard/pages/${page._id}`);
                }}
                className={`rounded-2xl border p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${isDarkMode
                  ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-700 hover:border-orange-600'
                  : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:border-orange-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {page.createdBy?.avatar ? (
                        <img
                          src={getImageUrl(page.createdBy.avatar)}
                          alt={page.createdBy.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                          <FileText className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold text-lg truncate transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{page.name}</h4>
                        {page.isVerified && <Star className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        <span className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{page.likes?.length || 0} people like this</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{page.followers?.length || 0} followers</span>
                        </span>
                        <span className={`font-medium px-3 py-1 rounded-lg transition-colors duration-200 ${isDarkMode
                          ? 'text-blue-400 bg-blue-900/30'
                          : 'text-blue-600 bg-blue-50'
                          }`}>{page.category}</span>
                      </div>
                      <p className={`text-sm mt-2 truncate transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{page.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(page._id);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${isLiked(page)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : isDarkMode
                          ? 'bg-gray-700 hover:bg-blue-900/30 hover:text-blue-400 text-gray-300 border-gray-600 hover:border-blue-500'
                          : 'bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 border-gray-200 hover:border-blue-200'
                        }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="hidden sm:inline">{isLiked(page) ? 'Liked' : 'Like'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoin(page._id);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${isJoined(page)
                        ? 'bg-green-500 text-white border-green-500'
                        : isDarkMode
                          ? 'bg-gray-700 hover:bg-green-900/30 hover:text-green-400 text-gray-300 border-gray-600 hover:border-green-500'
                          : 'bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-700 border-gray-200 hover:border-green-200'
                        }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">{isJoined(page) ? 'Joined' : 'Join'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`rounded-2xl border min-h-32 flex flex-col items-center justify-center p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200 ${isDarkMode
              ? 'bg-gradient-to-br from-orange-900/30 to-red-900/30'
              : 'bg-gradient-to-br from-orange-50 to-red-100'
              }`}>
              <FileText className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'
                }`} />
            </div>
            <p className={`text-lg font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>No promoted pages available</p>
          </div>
        )}
      </div>

      {/* Suggested Pages List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Suggested Pages</h3>
          <button
            onClick={() => window.location.reload()}
            className={`text-sm font-medium transition-colors duration-200 ${isDarkMode
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-blue-600 hover:text-blue-700'
              }`}
          >
            Refresh
          </button>
        </div>
        <p className={`mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
          }`}>Discover pages created by other users</p>
        {loading ? (
          <div className={`rounded-2xl border min-h-32 flex flex-col items-center justify-center p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`text-lg font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>Loading suggested pages...</p>
          </div>
        ) : otherPages.length > 0 ? (
          <div className="space-y-4">
            {otherPages.map((page: Page) => (
              <div
                key={page._id}
                onClick={() => {
                  // Navigate to page details or open page
                  router.push(`/dashboard/pages/${page._id}`);
                }}
                className={`rounded-2xl border p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                  : 'bg-white border-gray-100 hover:border-blue-200'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {page.createdBy?.avatar ? (
                        <img
                          src={getImageUrl(page.createdBy.avatar)}
                          alt={page.createdBy.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <FileText className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold text-lg truncate transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{page.name}</h4>
                        {page.isVerified && <Star className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        <span className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{page.likes?.length || 0} people like this</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{page.followers?.length || 0} followers</span>
                        </span>
                        <span className={`font-medium px-3 py-1 rounded-lg transition-colors duration-200 ${isDarkMode
                          ? 'text-blue-400 bg-blue-900/30'
                          : 'text-blue-600 bg-blue-50'
                          }`}>{page.category}</span>
                      </div>
                      <p className={`text-sm mt-2 truncate transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{page.description}</p>
                      <div className={`flex items-center gap-2 mt-2 text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                        <span>Created by {page.createdBy.name || page.createdBy.username}</span>
                        <span>•</span>
                        <span>{new Date(page.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(page._id);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${isLiked(page)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : isDarkMode
                          ? 'bg-gray-700 hover:bg-blue-900/30 hover:text-blue-400 text-gray-300 border-gray-600 hover:border-blue-500'
                          : 'bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 border-gray-200 hover:border-blue-200'
                        }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="hidden sm:inline">{isLiked(page) ? 'Liked' : 'Like'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoin(page._id);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${isJoined(page)
                        ? 'bg-green-500 text-white border-green-500'
                        : isDarkMode
                          ? 'bg-gray-700 hover:bg-green-900/30 hover:text-green-400 text-gray-300 border-gray-600 hover:border-green-500'
                          : 'bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-700 border-gray-200 hover:border-green-200'
                        }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">{isJoined(page) ? 'Joined' : 'Join'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`rounded-2xl border min-h-32 flex flex-col items-center justify-center p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200 ${isDarkMode
              ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30'
              : 'bg-gradient-to-br from-blue-50 to-indigo-100'
              }`}>
              <FileText className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'
                }`} />
            </div>
            <p className={`text-lg font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>No suggested pages available</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LikedPagesView: React.FC<{ likedPages: Page[], loading: boolean }> = ({ likedPages, loading }) => {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();

  if (loading) {
    return (
      <div className={`rounded-2xl border min-h-80 flex flex-col items-center justify-center p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className={`text-lg font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
          }`}>Loading liked pages...</p>
      </div>
    );
  }

  if (likedPages.length === 0) {
    return (
      <div className={`rounded-2xl border min-h-80 flex flex-col items-center justify-center p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-200 ${isDarkMode
          ? 'bg-gradient-to-br from-red-900/30 to-pink-900/30'
          : 'bg-gradient-to-br from-red-50 to-pink-100'
          }`}>
          <Heart className={`w-10 h-10 transition-colors duration-200 ${isDarkMode ? 'text-red-400' : 'text-red-500'
            }`} />
        </div>
        <h3 className={`text-xl font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>No liked pages yet</h3>
        <p className={`text-center max-w-md transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
          }`}>
          Start exploring and like pages that interest you to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-2xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Your Liked Pages</h3>
        <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
          }`}>{likedPages.length} page{likedPages.length !== 1 ? 's' : ''} you've liked</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {likedPages.map((page: Page) => (
          <div
            key={page._id}
            onClick={() => {
              // Navigate to page using page ID
              router.push(`/dashboard/pages/${page._id}`);
            }}
            className={`rounded-2xl border p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-red-500'
              : 'bg-white border-gray-100 hover:border-red-200'
              }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {page.createdBy?.avatar ? (
                  <img
                    src={getImageUrl(page.createdBy.avatar)}
                    alt={page.createdBy.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-bold text-lg truncate transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{page.name}</h4>
                  {page.isVerified && <Star className="w-4 h-4 text-blue-500" />}
                </div>
                <p className={`text-sm truncate transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{page.description}</p>
              </div>
            </div>

            <div className={`flex items-center justify-between text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-blue-500" />
                  <span>{page.likes?.length || 0}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>{page.followers?.length || 0}</span>
                </span>
              </div>
              <span className={`font-medium px-2 py-1 rounded-lg text-xs transition-colors duration-200 ${isDarkMode
                ? 'text-blue-400 bg-blue-900/30'
                : 'text-blue-600 bg-blue-50'
                }`}>{page.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PagesInterface: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<string>('My Pages');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [userPages, setUserPages] = useState<Page[]>([]);
  const [otherPages, setOtherPages] = useState<Page[]>([]);
  const [promotedPages, setPromotedPages] = useState<Page[]>([]);
  const [likedPages, setLikedPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOtherPages, setLoadingOtherPages] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    pageName: '',
    pageURL: '',
    pageDescription: '',
    pageCategory: ''
  });

  const tabs: Tab[] = [
    { name: 'My Pages', active: true },
    { name: 'Suggested pages', active: false },
    { name: 'Liked Pages', active: false }
  ];

  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const getCategoryName = (category: any) => {
    if (!category || typeof category !== 'object') return 'Untitled Category';
    return (
      category.english ||
      category.name ||
      category.title ||
      category.categoryName ||
      'Untitled Category'
    );
  };


  // Fetch pages from backend
  const fetchPages = async () => {
    try {
      setLoading(true);
      console.log('Fetching pages...');

      const [allPagesResponse, userPagesResponse] = await Promise.all([
        fetch(`${API_URL}/api/pages`),
        fetch(`${API_URL}/api/pages/user`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (allPagesResponse.ok) {
        const allPagesData = await allPagesResponse.json();
        console.log('All pages fetched:', allPagesData.length);
        setPages(allPagesData);

        // Filter other users' pages - show all pages except current user's own pages
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Current user:', currentUser);
        console.log('All pages data:', allPagesData);

        const otherUsersPages = allPagesData.filter((page: Page) => {
          // Check if page has createdBy object and it's not null/undefined
          if (!page.createdBy || !page.createdBy._id) {
            console.log(`Page ${page.name} - createdBy is missing or invalid, skipping`);
            return false;
          }

          const isNotOwnPage = page.createdBy._id !== currentUser._id &&
            page.createdBy._id !== currentUser.id;
          console.log(`Page ${page.name} - createdBy: ${page.createdBy._id}, currentUser: ${currentUser._id}, isNotOwnPage: ${isNotOwnPage}`);
          return isNotOwnPage;
        });

        console.log('Other users pages:', otherUsersPages.length);

        // If no other users' pages found, show all pages as fallback
        if (otherUsersPages.length === 0 && allPagesData.length > 0) {
          console.log('No other users pages found, showing all pages as fallback');
          setOtherPages(allPagesData);
        } else {
          setOtherPages(otherUsersPages);
        }

        // Filter promoted pages (pages with high likes or special flag)
        const finalOtherPages = otherUsersPages.length > 0 ? otherUsersPages : allPagesData;
        const promoted = finalOtherPages.filter((page: Page) =>
          (page.likes && Array.isArray(page.likes) && page.likes.length > 10) || page.isVerified
        );
        setPromotedPages(promoted);

        // Filter liked pages
        const liked = finalOtherPages.filter((page: Page) =>
          page.likes && Array.isArray(page.likes) &&
          (page.likes.includes(currentUser._id) || page.likes.includes(currentUser.id))
        );
        setLikedPages(liked);
      }

      if (userPagesResponse.ok) {
        const userPagesData = await userPagesResponse.json();
        console.log('User pages fetched:', userPagesData.length);
        setUserPages(userPagesData);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Load page categories created in admin
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/categories/pages`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const categoriesList = Array.isArray(data) ? data : data.categories || [];
        const names: string[] = categoriesList.map((cat: any) => getCategoryName(cat));

        if (names.length) {
          setCategories(names);
          setFormData(prev => {
            const current = prev.pageCategory || '';
            const nextCategory = names.includes(current) ? current : names[0];
            return { ...prev, pageCategory: nextCategory };
          });
        }
      } catch (error) {
        console.error('Error fetching page categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Refetch pages when switching to suggested pages tab
  useEffect(() => {
    if (activeTab === 'Suggested pages' && otherPages.length === 0) {
      fetchPages();
    }
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;

    // Auto-generate URL when page name changes
    if (name === 'pageName') {
      const url = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();

      setFormData(prev => ({
        ...prev,
        [name]: value,
        pageURL: url
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    return (
      formData.pageName.trim().length >= 3 &&
      formData.pageURL.trim().length >= 3 &&
      /^[a-z0-9-]+$/.test(formData.pageURL.trim()) &&
      formData.pageDescription.trim().length >= 10 &&
      formData.pageDescription.trim().length <= 200 &&
      formData.pageCategory.trim().length > 0
    );
  };

  const handleCreatePage = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');

      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        alert('Please log in to create a page');
        return;
      }

      // Enhanced validation with better feedback
      if (!formData.pageName.trim()) {
        alert('Page name is required');
        return;
      }

      if (formData.pageName.trim().length < 3) {
        alert('Page name must be at least 3 characters long');
        return;
      }

      if (!formData.pageURL.trim()) {
        alert('Page URL is required');
        return;
      }

      if (formData.pageURL.trim().length < 3) {
        alert('Page URL must be at least 3 characters long');
        return;
      }

      // Check if URL contains only valid characters
      if (!/^[a-z0-9-]+$/.test(formData.pageURL.trim())) {
        alert('Page URL can only contain lowercase letters, numbers, and hyphens');
        return;
      }

      if (!formData.pageDescription.trim()) {
        alert('Page description is required');
        return;
      }

      if (formData.pageDescription.length < 10) {
        alert('Page description must be at least 10 characters long');
        return;
      }

      if (formData.pageDescription.length > 200) {
        alert('Page description must be less than 200 characters');
        return;
      }

      setCreating(true);
      console.log('Creating page with data:', formData);

      const response = await fetch(`${API_URL}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.pageName,
          url: formData.pageURL,
          description: formData.pageDescription,
          category: formData.pageCategory,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error details:', errorData);
        alert('Error: ' + (errorData.error || 'Failed to create page'));
        return;
      }

      const data = await response.json();
      console.log('Page created successfully:', data);

      // Show success message
      alert('Page created successfully! Redirecting to your new page...');

      // Reset form data
      setFormData({
        pageName: '',
        pageURL: '',
        pageDescription: '',
        pageCategory: categories[0] || ''
      });

      // Close create form
      setShowCreateForm(false);

      // Refresh pages list
      await fetchPages();

      // Redirect to the newly created page
      router.push(`/dashboard/pages/${data._id}`);
    } catch (error: unknown) {
      console.error('Network error:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('Network error occurred. Please check your connection and try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleGoBack = (): void => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingPage(null);
    setFormData({
      pageName: '',
      pageURL: '',
      pageDescription: '',
      pageCategory: 'Cars and Vehicles'
    });
  };

  const handleEditPage = (page: Page): void => {
    setEditingPage(page);
    setFormData({
      pageName: page.name,
      pageURL: page.url,
      pageDescription: page.description,
      pageCategory: page.category
    });
    setShowEditForm(true);
  };

  const handleDeletePage = async (pageId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');

      if (!token || token === 'null' || token === 'undefined') {
        alert('Please log in to delete a page');
        return;
      }

      const response = await fetch(`${API_URL}/api/pages/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to delete page'));
        return;
      }

      alert('Page deleted successfully!');

      // Refresh pages list
      await fetchPages();
    } catch (error: unknown) {
      console.error('Network error:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('Network error occurred. Please check your connection and try again.');
      }
    }
  };

  const handleUpdatePage = async (): Promise<void> => {
    if (!editingPage) return;

    try {
      const token = localStorage.getItem('token');

      if (!token || token === 'null' || token === 'undefined') {
        alert('Please log in to update a page');
        return;
      }

      // Validation
      if (!formData.pageName.trim()) {
        alert('Page name is required');
        return;
      }

      if (formData.pageName.trim().length < 3) {
        alert('Page name must be at least 3 characters long');
        return;
      }

      if (!formData.pageURL.trim()) {
        alert('Page URL is required');
        return;
      }

      if (formData.pageURL.trim().length < 3) {
        alert('Page URL must be at least 3 characters long');
        return;
      }

      if (!/^[a-z0-9-]+$/.test(formData.pageURL.trim())) {
        alert('Page URL can only contain lowercase letters, numbers, and hyphens');
        return;
      }

      if (!formData.pageDescription.trim()) {
        alert('Page description is required');
        return;
      }

      if (formData.pageDescription.length < 10) {
        alert('Page description must be at least 10 characters long');
        return;
      }

      if (formData.pageDescription.length > 200) {
        alert('Page description must be less than 200 characters');
        return;
      }

      setUpdating(true);
      console.log('Updating page with data:', formData);

      const apiUrl = `${API_URL}/api/pages/${editingPage._id}`;
      console.log('Updating page at:', apiUrl);

      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.pageName,
            url: formData.pageURL,
            description: formData.pageDescription,
            category: formData.pageCategory,
          }),
        });
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        setUpdating(false);
        alert('Network error: Failed to connect to server. Please check your internet connection and ensure the backend server is running.');
        return;
      }

      console.log('Update response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Failed to update page (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          console.error('Server error details:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
          errorMessage = errorText || errorMessage;
        }
        alert('Error: ' + errorMessage);
        setUpdating(false);
        return;
      }

      const responseData = await response.json();
      console.log('Page updated successfully:', responseData);

      // Extract page data from response (backend returns { success, message, page })
      const updatedPage = responseData.page || responseData;

      // Update the page in the state immediately
      setUserPages(prev =>
        prev.map(page =>
          page._id === editingPage._id
            ? {
              ...page,
              ...updatedPage,
              name: updatedPage.name,
              url: updatedPage.url,
              description: updatedPage.description,
              category: updatedPage.category
            }
            : page
        )
      );

      // Also update in otherPages if it exists there
      setOtherPages(prev =>
        prev.map(page =>
          page._id === editingPage._id
            ? {
              ...page,
              ...updatedPage,
              name: updatedPage.name,
              url: updatedPage.url,
              description: updatedPage.description,
              category: updatedPage.category
            }
            : page
        )
      );

      // Reset form data
      setFormData({
        pageName: '',
        pageURL: '',
        pageDescription: '',
        pageCategory: categories[0] || ''
      });

      // Close edit form
      setShowEditForm(false);
      setEditingPage(null);

      // Refresh pages list to ensure consistency
      await fetchPages();

      alert('Page updated successfully!');

    } catch (error: unknown) {
      console.error('Network error:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('Network error occurred. Please check your connection and try again.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleLikePage = async (pageId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to like pages');
        return;
      }

      const response = await fetch(`${API_URL}/api/pages/${pageId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = currentUser._id || currentUser.id;
        const isLiked = data.isLiked;

        // Update the page in userPages list
        setUserPages(prev =>
          prev.map(page => {
            if (page._id === pageId) {
              if (isLiked) {
                // Add like
                const updatedLikes = page.likes || [];
                if (!updatedLikes.includes(userId)) {
                  updatedLikes.push(userId);
                }
                return { ...page, likes: updatedLikes };
              } else {
                // Remove like
                const updatedLikes = (page.likes || []).filter(id =>
                  id.toString() !== userId && id !== userId
                );
                return { ...page, likes: updatedLikes };
              }
            }
            return page;
          })
        );

        // Update the page in the otherPages list
        setOtherPages(prev =>
          prev.map(page => {
            if (page._id === pageId) {
              if (isLiked) {
                const updatedLikes = page.likes || [];
                if (!updatedLikes.includes(userId)) {
                  updatedLikes.push(userId);
                }
                return { ...page, likes: updatedLikes };
              } else {
                const updatedLikes = (page.likes || []).filter(id =>
                  id.toString() !== userId && id !== userId
                );
                return { ...page, likes: updatedLikes };
              }
            }
            return page;
          })
        );

        // Update promoted pages if this page is promoted
        setPromotedPages(prev =>
          prev.map(page => {
            if (page._id === pageId) {
              if (isLiked) {
                const updatedLikes = page.likes || [];
                if (!updatedLikes.includes(userId)) {
                  updatedLikes.push(userId);
                }
                return { ...page, likes: updatedLikes };
              } else {
                const updatedLikes = (page.likes || []).filter(id =>
                  id.toString() !== userId && id !== userId
                );
                return { ...page, likes: updatedLikes };
              }
            }
            return page;
          })
        );

        // Update liked pages list
        if (isLiked) {
          const likedPage = userPages.find(page => page._id === pageId) ||
            otherPages.find(page => page._id === pageId);
          if (likedPage && !likedPages.some(page => page._id === pageId)) {
            setLikedPages(prev => [...prev, likedPage]);
          }
        } else {
          setLikedPages(prev => prev.filter(page => page._id !== pageId));
        }
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to like page'));
      }
    } catch (error) {
      console.error('Error liking page:', error);
      alert('Network error occurred. Please try again.');
    }
  };

  const handleJoinPage = async (pageId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to follow pages');
        return;
      }

      const response = await fetch(`${API_URL}/api/pages/${pageId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = currentUser._id || currentUser.id;
        const isFollowing = data.isFollowing;

        // Update the page in userPages list
        setUserPages(prev =>
          prev.map(page => {
            if (page._id === pageId) {
              if (isFollowing) {
                // Add follower
                const updatedFollowers = page.followers || [];
                if (!updatedFollowers.includes(userId)) {
                  updatedFollowers.push(userId);
                }
                return { ...page, followers: updatedFollowers };
              } else {
                // Remove follower
                const updatedFollowers = (page.followers || []).filter(id =>
                  id.toString() !== userId && id !== userId
                );
                return { ...page, followers: updatedFollowers };
              }
            }
            return page;
          })
        );

        // Update the page in the otherPages list
        setOtherPages(prev =>
          prev.map(page => {
            if (page._id === pageId) {
              if (isFollowing) {
                const updatedFollowers = page.followers || [];
                if (!updatedFollowers.includes(userId)) {
                  updatedFollowers.push(userId);
                }
                return { ...page, followers: updatedFollowers };
              } else {
                const updatedFollowers = (page.followers || []).filter(id =>
                  id.toString() !== userId && id !== userId
                );
                return { ...page, followers: updatedFollowers };
              }
            }
            return page;
          })
        );

        // Update promoted pages if this page is promoted
        setPromotedPages(prev =>
          prev.map(page => {
            if (page._id === pageId) {
              if (isFollowing) {
                const updatedFollowers = page.followers || [];
                if (!updatedFollowers.includes(userId)) {
                  updatedFollowers.push(userId);
                }
                return { ...page, followers: updatedFollowers };
              } else {
                const updatedFollowers = (page.followers || []).filter(id =>
                  id.toString() !== userId && id !== userId
                );
                return { ...page, followers: updatedFollowers };
              }
            }
            return page;
          })
        );
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to follow page'));
      }
    } catch (error) {
      console.error('Error joining page:', error);
      alert('Network error occurred. Please try again.');
    }
  };

  // My Pages Component
  const MyPagesComponent: React.FC = () => {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (loading) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 min-h-80 flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-500 text-lg font-medium">Loading your pages...</p>
        </div>
      );
    }

    if (userPages.length === 0) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 min-h-80 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No pages yet</h3>
          <p className="text-gray-500 text-center mb-8 max-w-md">
            Create your first page to start building your online presence and connect with your audience.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Create New Page
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Your Pages</h3>
            <p className="text-gray-500 mt-1">{userPages.length} page{userPages.length !== 1 ? 's' : ''} • Click any page to open it</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Page
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {userPages.map((page) => (
            <div
              key={page._id}
              onClick={() => router.push(`/dashboard/pages/${page._id}`)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200">
                    <FileText className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-lg truncate">{page.name}</h4>
                      {page.isVerified && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">@{page.url}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-base mb-4 leading-relaxed line-clamp-3">{page.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
                    {page.category}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date(page.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="font-medium">{page.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">{page.followers?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const isCreator = page.createdBy?._id === currentUser._id || page.createdBy?._id === currentUser.id;

                      return isCreator ? (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === page._id ? null : page._id);
                            }}
                            className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode
                              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                              } ${openDropdownId === page._id ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                            title="More options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {openDropdownId === page._id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                }}
                              />
                              <div
                                className={`absolute right-0 bottom-full mb-2 w-40 rounded-lg shadow-lg border z-20 ${isDarkMode
                                  ? 'bg-gray-800 border-gray-700'
                                  : 'bg-white border-gray-200'
                                  }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(null);
                                    handleEditPage(page);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-t-lg transition-colors duration-200 ${isDarkMode
                                    ? 'hover:bg-gray-700 text-gray-300'
                                    : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                  <Edit className="w-4 h-4" />
                                  <span className="text-sm font-medium">Edit</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(null);
                                    if (confirm('Are you sure you want to delete this page?')) {
                                      handleDeletePage(page._id);
                                    }
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-b-lg transition-colors duration-200 ${isDarkMode
                                    ? 'hover:bg-gray-700 text-red-400'
                                    : 'hover:bg-gray-50 text-red-600'
                                    }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="text-sm font-medium">Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : null;
                    })()}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle share functionality
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode
                        ? 'text-gray-400 hover:text-green-400 hover:bg-gray-700'
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                      title="Share Page"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <div className={`w-6 h-6 transition-colors ${isDarkMode ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-500'
                      }`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Create Page Form Component
  const CreatePageForm: React.FC = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-3xl mx-auto shadow-lg">
      {/* Form Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Page</h2>
            <p className="text-gray-500 mt-1">Build your online presence</p>
          </div>
        </div>
        <button
          onClick={handleGoBack}
          className="sm:hidden p-3 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
        {/* Page Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Page Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="pageName"
            value={formData.pageName}
            onChange={handleInputChange}
            placeholder="Enter your page name"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${formData.pageName.length > 0
              ? formData.pageName.length >= 3
                ? 'border-green-300 bg-green-50'
                : 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          />
          {formData.pageName.length > 0 && (
            <div className={`text-sm mt-2 ${formData.pageName.length >= 3 ? 'text-green-600' : 'text-red-500'
              }`}>
              {formData.pageName.length >= 3
                ? '✓ Page name is valid'
                : `Page name must be at least 3 characters (${formData.pageName.length}/3)`
              }
            </div>
          )}
        </div>

        {/* Page URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Page URL <span className="text-red-500">*</span></label>
          <div className="flex">
            <span className="inline-flex items-center px-4 py-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
              https://jaifriend.com/
            </span>
            <input
              type="text"
              name="pageURL"
              value={formData.pageURL}
              onChange={handleInputChange}
              placeholder="your-page-url"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-lpignore="true"
              data-form-type="other"
              className={`flex-1 p-4 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${formData.pageURL.length > 0
                ? formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
                  ? 'border-green-300 bg-green-50'
                  : 'border-red-300 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            />
          </div>
          {formData.pageURL.length > 0 && (
            <div className={`text-sm mt-2 ${formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL) ? 'text-green-600' : 'text-red-500'
              }`}>
              {formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
                ? '✓ URL is valid'
                : formData.pageURL.length < 3
                  ? `URL must be at least 3 characters (${formData.pageURL.length}/3)`
                  : 'URL can only contain lowercase letters, numbers, and hyphens'
              }
            </div>
          )}
        </div>

        {/* Page Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Page Description <span className="text-red-500">*</span></label>
          <textarea
            name="pageDescription"
            value={formData.pageDescription}
            onChange={handleInputChange}
            rows={4}
            placeholder="Describe what your page is about..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base transition-all duration-200 ${formData.pageDescription.length > 0
              ? formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
                ? 'border-green-300 bg-green-50'
                : 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500">
              Between 10 and 200 characters
            </p>
            <span className={`text-sm font-medium ${formData.pageDescription.length > 200 ? 'text-red-500' :
              formData.pageDescription.length >= 10 ? 'text-green-500' : 'text-gray-400'
              }`}>
              {formData.pageDescription.length}/200
            </span>
          </div>
          {formData.pageDescription.length > 0 && (
            <div className={`text-sm mt-2 ${formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200 ? 'text-green-600' : 'text-red-500'
              }`}>
              {formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
                ? '✓ Description is valid'
                : formData.pageDescription.length < 10
                  ? `Description must be at least 10 characters (${formData.pageDescription.length}/10)`
                  : 'Description must be less than 200 characters'
              }
            </div>
          )}
        </div>

        {/* Page Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Page Category <span className="text-red-500">*</span></label>
          <select
            name="pageCategory"
            value={formData.pageCategory}
            onChange={handleInputChange}
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-300"
          >
            {categories.map((category: string) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Choose the category that best describes your page
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleGoBack}
            disabled={creating}
            className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 px-6 py-3 rounded-xl hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5" />
            Go back
          </button>
          <button
            onClick={handleCreatePage}
            disabled={creating || !isFormValid()}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            {creating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Page...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Page
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );



  const renderContent = (): React.ReactElement => {
    if (showCreateForm) {
      return (
        <CreatePageFormView
          formData={formData}
          categories={categories}
          categoriesLoading={categoriesLoading}
          creating={creating}
          isFormValid={isFormValid()}
          onInputChange={handleInputChange}
          onCreate={handleCreatePage}
          onGoBack={handleGoBack}
        />
      );
    }

    if (showEditForm) {
      return (
        <EditPageFormView
          formData={formData}
          categories={categories}
          categoriesLoading={categoriesLoading}
          creating={creating}
          isFormValid={isFormValid()}
          onInputChange={handleInputChange}
          onCreate={handleUpdatePage}
          onGoBack={handleGoBack}
          updating={updating}
        />
      );
    }

    switch (activeTab) {
      case 'My Pages':
        return (
          <MyPagesView
            loading={loading}
            userPages={userPages}
            onCreate={() => setShowCreateForm(true)}
            onOpenPage={(id) => {
              // Use page ID if it's a valid ObjectId, otherwise use as-is (for URLs)
              router.push(`/dashboard/pages/${id}`);
            }}
            onEdit={handleEditPage}
            onDelete={handleDeletePage}
            onLike={handleLikePage}
            onJoin={handleJoinPage}
          />
        );
      case 'Suggested pages':
        return (
          <SuggestedPagesView
            promotedPages={promotedPages}
            otherPages={otherPages}
            onLike={handleLikePage}
            onJoin={handleJoinPage}
            loading={loadingOtherPages}
          />
        );
      case 'Liked Pages':
        return <LikedPagesView likedPages={likedPages} loading={loading} />;
      default:
        return (
          <MyPagesView
            loading={loading}
            userPages={userPages}
            onCreate={() => setShowCreateForm(true)}
            onOpenPage={(id) => {
              // Use page ID if it's a valid ObjectId, otherwise use as-is (for URLs)
              router.push(`/dashboard/pages/${id}`);
            }}
            onEdit={handleEditPage}
            onDelete={handleDeletePage}
            onLike={handleLikePage}
            onJoin={handleJoinPage}
          />
        );
    }
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      {/* Header */}
      <header className={`shadow-sm border-b sticky top-0 z-30 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {(showCreateForm || showEditForm) && (
                <button
                  onClick={handleGoBack}
                  className={`sm:hidden p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                >
                  <ArrowLeft className={`w-6 h-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                </button>
              )}
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  {showCreateForm ? 'Create Page' : showEditForm ? 'Edit Page' : 'Pages'}
                </h1>
                {!showCreateForm && !showEditForm && (
                  <p className={`text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Manage and discover amazing pages</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Button (Mobile) */}
              <button className={`sm:hidden p-3 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                <Search className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`} />
              </button>

              {/* Action Buttons */}
              {/* Removed camera and users icon buttons from mobile menu */}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className={`sm:hidden p-3 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
              >
                <Menu className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div className={`absolute right-0 top-0 h-full w-72 shadow-2xl transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 border-b transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                >
                  <X className={`w-6 h-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {/* Removed camera and users icon buttons from pages dashboard */}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Desktop Only */}
      {!showCreateForm && !showEditForm && (
        <nav className={`hidden sm:block border-b transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <div className="px-6 lg:px-8">
            <div className="flex">
              {tabs.map((tab: Tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === tab.name
                    ? 'text-blue-600 border-blue-600'
                    : isDarkMode
                      ? 'text-gray-300 border-transparent hover:text-blue-400 hover:border-gray-600'
                      : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-gray-200'
                    }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>

      {/* Floating Action Button - Only show if not in create or edit form */}
      {!showCreateForm && !showEditForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center z-20 group"
        >
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* Mobile Bottom Safe Area */}
      <div className="sm:hidden h-safe-area-inset-bottom"></div>
    </div>
  );
};

export default PagesInterface;

"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaStar, FaPhone, FaVideo, FaComments } from 'react-icons/fa';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { config } from '@/utils/config';

interface P2PCategory {
  _id: string;
  title: string;
  description?: string;
  image?: string;
}

interface ProfileUser {
  _id: string;
  name?: string;
  fullName?: string;
  username?: string;
  avatar?: string;
}

interface P2PProfileSummary {
  _id: string;
  userId: ProfileUser;
  occupation?: string;
  description?: string;
  areasOfExpertise?: string[];
  audioCallPrice?: string;
  videoCallPrice?: string;
  chatPrice?: string;
  currency?: string;
  rating?: {
    average?: number;
    count?: number;
  };
  category?: P2PCategory | null;
}

const getAvatarUrl = (url?: string | null) => {
  if (!url) return '/default-avatar.svg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/avatars/') || url.startsWith('/default-avatar')) return url;
  const cleanUrl = url.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${config.API_URL}/${cleanUrl}`;
};

const getCurrencySymbol = (currency?: string) => (currency === 'INR' ? '₹' : '$');

const formatPrice = (value?: string | number | null, currency?: string) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const numericValue =
    typeof value === 'number'
      ? value
      : Number.parseFloat(
          (value as string)
            .replace(/[^\d.]/g, '')
        );
  if (Number.isNaN(numericValue)) {
    return `${getCurrencySymbol(currency)}${value}`;
  }
  return `${getCurrencySymbol(currency)}${numericValue.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
};

const fetchWithToken = (endpoint: string, token: string) =>
  fetch(`${config.API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

export default function CategoryProfilesPage() {
  const params = useParams();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const categoryId = params?.categoryId as string | undefined;

  const [category, setCategory] = useState<P2PCategory | null>(null);
  const [profiles, setProfiles] = useState<P2PProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategoryProfiles = async () => {
      if (!categoryId) {
        setError('Missing category identifier.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be signed in to browse experts.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [categoryRes, profilesRes] = await Promise.all([
          fetchWithToken('/api/p2p/categories', token),
          fetchWithToken(`/api/p2p/profiles?category=${categoryId}`, token),
        ]);

        if (!categoryRes.ok) {
          throw new Error('Unable to load categories.');
        }
        const categoriesData = await categoryRes.json();
        const matchedCategory: P2PCategory | undefined = (categoriesData.categories || []).find(
          (item: P2PCategory) => item._id === categoryId
        );
        setCategory(matchedCategory || null);

        if (!profilesRes.ok) {
          throw new Error('Unable to load experts for this category.');
        }
        const profilesData = await profilesRes.json();
        setProfiles(Array.isArray(profilesData.profiles) ? profilesData.profiles : []);
      } catch (err) {
        setProfiles([]);
        setError(err instanceof Error ? err.message : 'Something went wrong while loading this category.');
      } finally {
        setLoading(false);
      }
    };

    loadCategoryProfiles();
  }, [categoryId]);

  const pageTitle = category?.title || 'Experts';
  const categoryDescription = category?.description || 'Browse trusted mentors curated for this topic.';

  const expertsCountLabel = useMemo(() => {
    if (!profiles.length) return 'No experts are available yet.';
    if (profiles.length === 1) return '1 expert available';
    return `${profiles.length} experts available`;
  }, [profiles.length]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#148F80] mb-4" />
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading experts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`rounded-2xl border p-8 text-center ${isDarkMode ? 'border-red-900 bg-red-950/30 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
          <p className="text-base font-medium mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-current"
            >
              Go back
            </button>
            <Link
              href="/dashboard/p2p"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#148F80] text-white"
            >
              Browse all categories
            </Link>
          </div>
        </div>
      );
    }

    if (!profiles.length) {
      return (
        <div className={`rounded-2xl border p-10 text-center ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
          <p className="text-lg font-semibold mb-2">We’re curating experts for this category.</p>
          <p className="text-sm mb-6">
            Check back soon or explore other categories to connect with available mentors.
          </p>
          <Link
            href="/dashboard/p2p"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-[#148F80] text-white"
          >
            Browse other categories
          </Link>
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 justify-items-center">
        {profiles.map((profile) => {
          const profileName = profile.userId.fullName || profile.userId.name || 'Expert';
          const allTags = profile.areasOfExpertise || [];
          const uniqueTags = Array.from(new Set(allTags));
          return (
            <article
              key={profile._id}
              onClick={() => router.push(`/dashboard/p2p/${profile._id}`)}
              className={`w-full max-w-[400px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-[20px] p-6 shadow-lg text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer hover:shadow-xl transition-all`}
            >
              <div className="relative mx-auto mb-4 w-[100px] h-[100px]">
                <Image
                  src={getAvatarUrl(profile.userId.avatar)}
                  alt={profileName}
                  width={100}
                  height={100}
                  className={`w-full h-full rounded-full border-4 ${isDarkMode ? 'border-gray-600' : 'border-[#f0f0f0]'} object-cover`}
                  unoptimized
                />
                <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-blue-500 px-3 py-1.5 rounded-[20px] flex items-center gap-1.5 shadow-lg">
                  <FaStar 
                    className="w-3.5 h-3.5 text-white"
                  />
                  <span className="text-xs font-semibold text-white">
                    {(profile.rating?.average || 0).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {profileName}
                </h1>
                {profile.occupation && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {profile.occupation}
                  </p>
                )}
              </div>
              {profile.description && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed mb-4 line-clamp-3 overflow-hidden text-ellipsis break-words`}>
                  {profile.description}
                </p>
              )}
              {uniqueTags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {uniqueTags.slice(0, 5).map((tag: string, idx: number) => (
                    <div 
                      key={idx}
                      className={`${isDarkMode ? 'bg-gray-700' : 'bg-[#f0f0f0]'} ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-xs px-3 py-1.5 rounded-[20px] hover:bg-blue-500 hover:text-white transition-all`}
                    >
                      {tag}
                    </div>
                  ))}
                  {uniqueTags.length > 5 && (
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-[#f0f0f0]'} ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-xs px-3 py-1.5 rounded-[20px]`}>
                      +{uniqueTags.length - 5} more
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-center gap-4">
                {profile.audioCallPrice && (
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/p2p/${profile._id}`);
                    }}
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white no-underline transition-all hover:-translate-y-1 hover:shadow-lg shadow-md"
                  >
                    <FaPhone 
                      className="w-6 h-6 text-white"
                    />
                    <span className="text-xs font-medium">{formatPrice(profile.audioCallPrice, profile.currency)}</span>
                  </a>
                )}
                {profile.videoCallPrice && (
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/p2p/${profile._id}`);
                    }}
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white no-underline transition-all hover:-translate-y-1 hover:shadow-lg shadow-md"
                  >
                    <FaVideo 
                      className="w-6 h-6 text-white"
                    />
                    <span className="text-xs font-medium">{formatPrice(profile.videoCallPrice, profile.currency)}</span>
                  </a>
                )}
                {profile.chatPrice && (
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/p2p/${profile._id}`);
                    }}
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white no-underline transition-all hover:-translate-y-1 hover:shadow-lg shadow-md"
                  >
                    <FaComments 
                      className="w-6 h-6 text-white"
                    />
                    <span className="text-xs font-medium">{formatPrice(profile.chatPrice, profile.currency)}</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
              isDarkMode
                ? 'border-gray-700 text-gray-200 hover:bg-gray-800'
                : 'border-gray-200 text-gray-700 hover:bg-white'
            }`}
          >
            <FaArrowLeft className="h-4 w-4" />
            Back
          </button>
          <Link
            href="/dashboard/p2p"
            className="text-sm text-[#148F80] font-semibold hover:underline"
          >
            Browse all categories
          </Link>
        </div>

        <div className={`rounded-3xl border p-6 sm:p-8 ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-[#148F80] font-semibold mb-2">
                Category spotlight
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">{pageTitle}</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl">
                {categoryDescription}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Availability</p>
              <p className="text-base font-semibold">{expertsCountLabel}</p>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}











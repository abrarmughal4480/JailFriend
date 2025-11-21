"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaStar } from 'react-icons/fa';
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
      <div className="grid gap-6 sm:grid-cols-2">
        {profiles.map((profile) => {
          const profileName = profile.userId.fullName || profile.userId.name || 'Expert';
          const expertiseTags = profile.areasOfExpertise?.slice(0, 3) || [];
          const startingPrice =
            profile.audioCallPrice || profile.videoCallPrice || profile.chatPrice || null;
          return (
            <article
              key={profile._id}
              className={`rounded-2xl border p-5 flex flex-col gap-4 ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'}`}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={getAvatarUrl(profile.userId.avatar)}
                    alt={profileName}
                    fill
                    sizes="64px"
                    className="rounded-full object-cover border-2 border-[#148F80]/30"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold leading-tight">{profileName}</p>
                  {profile.occupation && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{profile.occupation}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-500 mt-1">
                    <FaStar className="h-4 w-4" />
                    <span>{(profile.rating?.average || 5).toFixed(1)}</span>
                    {profile.rating?.count ? (
                      <span className="text-gray-400 dark:text-gray-500">
                        ({profile.rating.count} reviews)
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {profile.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {profile.description}
                </p>
              )}

              {expertiseTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {expertiseTags.map((tag) => (
                    <span
                      key={`${profile._id}-${tag}`}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[#148F80]/10 text-[#148F80]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Starting at
                  </p>
                  <p className="text-base font-semibold">
                    {formatPrice(startingPrice, profile.currency)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/p2p/${profile._id}`)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#148F80] text-white hover:bg-[#0f6f63] transition-colors"
                  >
                    View profile
                  </button>
                </div>
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










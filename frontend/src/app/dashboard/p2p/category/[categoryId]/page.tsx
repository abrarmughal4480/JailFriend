"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaStar, FaPhone, FaVideo, FaComments, FaPlus, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
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
  currentOrganisation?: string;
  experience?: string;
  aboutMeLocation?: string;
  description?: string;
  areasOfExpertise?: string[];
  skills?: string[];
  tags?: string[];
  hourlyRate?: number;
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

  const ProfileCard = ({ profile }: { profile: P2PProfileSummary }) => {
    const handlers = {
      view: () => router.push(`/dashboard/p2p/${profile._id}`),
      contact: (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/dashboard/p2p/${profile._id}`);
      },
      call: (e: React.MouseEvent, mode: 'audio' | 'video') => {
        e.stopPropagation();
        router.push(`/dashboard/p2p/${profile._id}?mode=${mode}`);
      }
    };

    const allTags = [
      ...(profile.areasOfExpertise || []),
      ...(profile.skills || []),
      ...(profile.tags || [])
    ];
    const uniqueTags = Array.from(new Set(allTags));

    return (
      <div
        onClick={handlers.view}
        className={`relative w-full overflow-hidden rounded-[20px] p-5 transition-all cursor-pointer border ${isDarkMode
          ? 'bg-[#121818] border-white/5 hover:border-teal-500/20 shadow-2xl'
          : 'bg-white border-gray-100 hover:border-teal-500/20 shadow-xl'
          } group`}
      >
        <div className="flex gap-4 sm:gap-6">
          {/* Left Part: Content (Now organized in rows) */}
          <div className="flex-1 flex flex-col gap-4">

            {/* ROW 1: Avatar + Title/Bio */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center shrink-0">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-[2px] border-teal-500/80 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                    <Image
                      src={getAvatarUrl(profile.userId.avatar)}
                      alt={profile.userId.fullName || profile.userId.name || 'Expert'}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-0.5 mt-0.5">
                  <h3 className={`text-base sm:text-lg font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profile.userId.fullName || profile.userId.name}
                  </h3>
                  <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
                    <FaPlus className="text-white text-[8px]" />
                  </div>
                </div>

                <p className={`text-[10px] sm:text-[11px] font-medium mb-1 ${isDarkMode ? 'text-gray-400/80' : 'text-gray-500'}`}>
                  {profile.occupation || profile.currentOrganisation || 'Professional'}
                </p>

                <p className={`text-[10px] leading-relaxed break-all line-clamp-2 text-gray-500`}>
                  {profile.description || profile.experience || 'Expert professional guidance and support.'}
                </p>
              </div>
            </div>

            {/* ROW 2: Rating (under avatar) + Company/Location */}
            <div className="flex gap-4 items-center">
              <div className="w-16 flex justify-center shrink-0">
                <div className="flex items-center gap-1">
                  <FaStar className="w-2.5 h-2.5 text-orange-400 fill-orange-400" />
                  <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profile.rating?.average?.toFixed(0) || '0'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 shrink">
                  <FaBuilding className={`w-3 h-3 shrink-0 text-gray-400/60`} />
                  <span className={`text-[10px] font-medium truncate text-gray-400/80`}>
                    {profile.currentOrganisation || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0 shrink">
                  <FaMapMarkerAlt className={`w-3 h-3 shrink-0 text-gray-400/60`} />
                  <span className={`text-[10px] font-medium truncate text-gray-400/80`}>
                    {profile.aboutMeLocation || 'Remote'}
                  </span>
                </div>
              </div>
            </div>

            {/* ROW 3: I can help with */}
            <div className={`pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-50'} flex flex-col gap-2`}>
              <span className={`text-[10px] font-medium text-gray-500`}>
                I can help with:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {uniqueTags.slice(0, 3).map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-md text-[9px] font-medium transition-colors ${isDarkMode
                      ? 'bg-[#1C2424] text-gray-300 border border-white/5'
                      : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {tag}
                  </span>
                ))}
                {uniqueTags.length > 3 && (
                  <span className={`px-2 py-1 rounded-md text-[9px] font-semibold ${isDarkMode ? 'text-teal-400 bg-[#1C2424]' : 'text-teal-600 bg-gray-100'}`}>
                    +{uniqueTags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Part: Actions */}
          <div className="flex flex-col gap-4 shrink-0 justify-center w-[70px] sm:w-[80px]">
            {/* Audio Call */}
            <div className="flex flex-col items-start gap-1">
              <button
                onClick={(e) => handlers.call(e, 'audio')}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${isDarkMode
                  ? 'border-teal-400/40 bg-[#1C2424] text-white hover:bg-teal-500/20'
                  : 'border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100'
                  }`}
              >
                <FaPhone className="w-3.5 h-3.5" />
              </button>
              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatPrice(profile.audioCallPrice || profile.hourlyRate, profile.currency)}
              </span>
            </div>

            {/* Video Call */}
            <div className="flex flex-col items-start gap-1">
              <button
                onClick={(e) => handlers.call(e, 'video')}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${isDarkMode
                  ? 'border-teal-400/40 bg-[#1C2424] text-white hover:bg-teal-500/20'
                  : 'border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100'
                  }`}
              >
                <FaVideo className="w-3.5 h-3.5" />
              </button>
              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatPrice(profile.videoCallPrice || profile.hourlyRate, profile.currency)}
              </span>
            </div>

            {/* Chat */}
            <div className="flex flex-col items-start gap-1">
              <button
                onClick={handlers.contact}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${isDarkMode
                  ? 'border-orange-400/40 bg-[#1C2424] text-white hover:bg-orange-500/20'
                  : 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                  }`}
              >
                <FaComments className="w-3.5 h-3.5" />
              </button>
              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatPrice(profile.chatPrice || (profile.hourlyRate ? profile.hourlyRate / 10 : 0), profile.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      <div className="grid gap-6 lg:grid-cols-2 justify-items-center">
        {profiles.map((profile) => (
          <ProfileCard key={profile._id} profile={profile} />
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${isDarkMode
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











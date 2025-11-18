"use client";
import React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupUserApi, getSuggestedUsersApi, getUserProfileApi, uploadProfilePhotoApi, followUserApi } from '@/utils/api';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { config } from '@/utils/config';
import { getCurrentUserId } from '@/utils/auth';

// Fallback users in case API fails
const fallbackUsers = [
  { name: "Daniel John", img: "/avatars/1.png.png" },
  { name: "Blanie William", img: "/avatars/2.png.png" },
  { name: "Bruce Lester", img: "/avatars/4.png.png" },
  { name: "Mark Johnson", img: "/avatars/7.png.png" },
  { name: "Elisa Johnson", img: "/avatars/19.png.png" },
  { name: "Jenny Miller", img: "/avatars/20.png.png" },
];

// Default avatars list for Media step (step 0)
const defaultAvatars = [
  "/avatars/1.png.png",
  "/avatars/2.png.png",
  "/avatars/3.png.png",
  "/avatars/4.png.png",
  "/avatars/5.pmg.png",
  "/avatars/6.png.png",
  "/avatars/7.png.png",
  "/avatars/8.png.png",
  "/avatars/9.png.png",
  "/avatars/10.png",
  "/avatars/11.png.png",
  "/avatars/12.png.png",
  "/avatars/13.png.png",
  "/avatars/14.png.png",
  "/avatars/15.png.png",
  "/avatars/16.png.png",
  "/avatars/17.png.png",
  "/avatars/18.png.png",
  "/avatars/19.png.png",
  "/avatars/20.png.png",
];

const steps = ["Media", "Info", "About Me", "My Expertise", "Pricing Details", "Available Time", "Social Media Links", "Follow", "Advisor"];

export default function StartUpPage() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [step, setStep] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [currentOrganisation, setCurrentOrganisation] = useState("");
  const [aboutMeLocation, setAboutMeLocation] = useState("");
  const [description, setDescription] = useState("");
  const [areasOfExpertise, setAreasOfExpertise] = useState("");
  const [expertiseTags, setExpertiseTags] = useState<string[]>([]);
  const [audioCallPrice, setAudioCallPrice] = useState("");
  const [videoCallPrice, setVideoCallPrice] = useState("");
  const [chatPrice, setChatPrice] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [linkedInLink, setLinkedInLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [availableFromTime, setAvailableFromTime] = useState("");
  const [availableToTime, setAvailableToTime] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; title: string }>>([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState(fallbackUsers);
  const [usersLoading, setUsersLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedUsersToFollow, setSelectedUsersToFollow] = useState<Set<string>>(new Set());
  const [followingUsers, setFollowingUsers] = useState(false);
  const [savedSteps, setSavedSteps] = useState({
    step1: false, // Avatar selected
    step2: false, // Info filled
    step3: false, // About Me filled
    step4: false, // My Expertise filled
    step5: false, // Pricing Details filled
    step6: false, // Available Time filled
    step7: false, // Social Media Links filled
    step8: false, // Follow completed (optional)
    step9: false  // Advisor completed (optional)
  });
  const [popup, setPopup] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  // Show popup helper functions
  const showPopup = (type: 'success' | 'error', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  // Save step data - only saves the current step's data, not previous steps
  const saveStepData = async (stepNumber: number, data: any, skipped: boolean = false) => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      console.log(`💾 Saving step ${stepNumber} data only (skipped: ${skipped}):`, data);
      
      // Prepare data object - only include data for the current step
      const payload: any = {
        stepNumber,
        skipped
      };

      // Step 1: Avatar - only save if this is step 1
      if (stepNumber === 1) {
        payload.avatar = data.avatar !== undefined ? data.avatar : selectedAvatar;
      }

      // Step 2: Info - only save if this is step 2
      if (stepNumber === 2) {
        payload.fullName = data.fullName !== undefined ? data.fullName : fullName;
        payload.bio = data.bio !== undefined ? data.bio : bio;
        payload.location = data.location !== undefined ? data.location : location;
      }

      // Step 3: About Me - only save if this is step 3
      if (stepNumber === 3) {
        payload.workExperience = data.workExperience !== undefined ? data.workExperience : workExperience;
        payload.currentOrganisation = data.currentOrganisation !== undefined ? data.currentOrganisation : currentOrganisation;
        payload.aboutMeLocation = data.aboutMeLocation !== undefined ? data.aboutMeLocation : aboutMeLocation;
        payload.description = data.description !== undefined ? data.description : description;
      }

      // Step 4: My Expertise - only save if this is step 4
      if (stepNumber === 4) {
        payload.areasOfExpertise = data.areasOfExpertise !== undefined ? data.areasOfExpertise : expertiseTags;
      payload.categoryId = data.categoryId !== undefined ? data.categoryId : categoryId;
      }

      // Step 5: Pricing Details - only save if this is step 5
      if (stepNumber === 5) {
        payload.audioCallPrice = data.audioCallPrice !== undefined ? data.audioCallPrice : audioCallPrice;
        payload.videoCallPrice = data.videoCallPrice !== undefined ? data.videoCallPrice : videoCallPrice;
        payload.chatPrice = data.chatPrice !== undefined ? data.chatPrice : chatPrice;
        payload.currency = data.currency !== undefined ? data.currency : currency;
      }

      // Step 6: Available Time - only save if this is step 6
      if (stepNumber === 6) {
        payload.availableFromTime = data.availableFromTime !== undefined ? data.availableFromTime : availableFromTime;
        payload.availableToTime = data.availableToTime !== undefined ? data.availableToTime : availableToTime;
        payload.availableDays = data.availableDays !== undefined ? data.availableDays : availableDays;
      }

      // Step 7: Social Media Links - only save if this is step 7
      if (stepNumber === 7) {
        payload.linkedInLink = data.linkedInLink !== undefined ? data.linkedInLink : linkedInLink;
        payload.instagramLink = data.instagramLink !== undefined ? data.instagramLink : instagramLink;
        payload.twitterLink = data.twitterLink !== undefined ? data.twitterLink : twitterLink;
      }

      // Steps 8 and 9 don't have form data, they're just completion steps
      // They will be handled separately when user clicks their buttons

      // Send data to backend
      await setupUserApi(token, payload);
      
      console.log(`✅ Step ${stepNumber} data saved successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to save step ${stepNumber}:`, error);
      return false;
    }
  };

  // Fetch user profile data and prefill form fields
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const profileData = await getUserProfileApi(token);
      console.log('✅ Fetched user profile:', profileData);
      
      // Prefill all form fields with existing data
      if (profileData) {
        // Helper function to set value if it exists and is not empty
        const setIfExists = (value: any, setter: (val: string) => void) => {
          if (value !== null && value !== undefined && value !== '') {
            setter(String(value));
          }
        };

        setIfExists(profileData.avatar, setSelectedAvatar);
        setIfExists(profileData.fullName, setFullName);
        setIfExists(profileData.bio, setBio);
        setIfExists(profileData.location, setLocation);
        setIfExists(profileData.workExperience, setWorkExperience);
        setIfExists(profileData.currentOrganisation, setCurrentOrganisation);
        setIfExists(profileData.aboutMeLocation, setAboutMeLocation);
        setIfExists(profileData.description, setDescription);
        
        // Handle areas of expertise (array)
        if (profileData.areasOfExpertise && Array.isArray(profileData.areasOfExpertise) && profileData.areasOfExpertise.length > 0) {
          setExpertiseTags(profileData.areasOfExpertise);
          setAreasOfExpertise(profileData.areasOfExpertise.join(', '));
        }
        if (profileData.category?._id || profileData.categoryId) {
          setCategoryId(profileData.category?._id || profileData.categoryId);
        }
        
        setIfExists(profileData.audioCallPrice, setAudioCallPrice);
        setIfExists(profileData.videoCallPrice, setVideoCallPrice);
        setIfExists(profileData.chatPrice, setChatPrice);
        if (profileData.currency && (profileData.currency === 'USD' || profileData.currency === 'INR')) {
          setCurrency(profileData.currency);
        }
        setIfExists(profileData.linkedInLink, setLinkedInLink);
        setIfExists(profileData.instagramLink, setInstagramLink);
        setIfExists(profileData.twitterLink, setTwitterLink);
        setIfExists(profileData.availableFromTime, setAvailableFromTime);
        setIfExists(profileData.availableToTime, setAvailableToTime);
        if (profileData.availableDays && Array.isArray(profileData.availableDays)) {
          setAvailableDays(profileData.availableDays);
        }

        // Store userType in localStorage if available
        if (profileData.userType) {
          localStorage.setItem('userType', profileData.userType);
        }

        // Update saved steps based on what data exists
        setSavedSteps({
          step1: !!profileData.avatar,
          step2: !!(profileData.fullName && profileData.location),
          step3: !!(profileData.workExperience || profileData.currentOrganisation || profileData.description),
          step4: !!((profileData.areasOfExpertise && profileData.areasOfExpertise.length > 0) || profileData.category || profileData.categoryId),
          step5: !!(profileData.audioCallPrice || profileData.videoCallPrice || profileData.chatPrice),
          step6: !!(profileData.availableFromTime || profileData.availableToTime || (profileData.availableDays && profileData.availableDays.length > 0)),
          step7: !!(profileData.linkedInLink || profileData.instagramLink || profileData.twitterLink),
          step8: false, // These are optional steps
          step9: false
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      // Continue without prefilling if fetch fails
    }
  };

  // Fetch real users from database
  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setUsersLoading(true);
    try {
      const response = await getSuggestedUsersApi(token);
      console.log('✅ Fetched real users:', response);
      
      // API returns array directly, not {users: []}
      const usersArray = Array.isArray(response) ? response : (response?.users || []);
      
      // Get current user ID to filter out
      const currentUserId = getCurrentUserId();
      
      if (usersArray && usersArray.length > 0) {
        // Transform API response to match our format with all original user data
        // Filter out current user
        const transformedUsers = usersArray
          .filter((user: any) => {
            const userId = user._id || user.id;
            return userId && userId !== currentUserId;
          })
          .map((user: any) => ({
            name: user.fullName || user.name || user.username || 'Unknown User',
            fullName: user.fullName || user.name || user.username,
            username: user.username || '',
            img: user.avatar || '/default-avatar.svg',
            avatar: user.avatar || '/default-avatar.svg',
            userId: user._id || user.id,
            _id: user._id || user.id,
            bio: user.bio || '',
            occupation: user.occupation || '',
            description: user.description || user.bio || '',
            location: user.location || '',
            areasOfExpertise: user.areasOfExpertise || user.expertise || user.tags || [],
            audioCallPrice: user.audioCallPrice || user.audioPrice || '',
            videoCallPrice: user.videoCallPrice || user.videoPrice || '',
            chatPrice: user.chatPrice || '',
            isVerified: user.isVerified || false,
            isOnline: user.isOnline || false,
            followers: user.followers || [],
            following: user.following || []
          }));
        setUsers(transformedUsers);
        console.log('✅ Transformed users (filtered current user):', transformedUsers.length);
      } else {
        console.log('⚠️ No users found, using fallback');
        // Fallback users are just placeholders, no need to filter
        setUsers(fallbackUsers);
      }
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      // Keep fallback users if API fails (they're just placeholders)
      setUsers(fallbackUsers);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/api/p2p/categories`);
      if (!response.ok) {
        throw new Error('Failed to load categories');
      }
      const data = await response.json();
      setCategories(Array.isArray(data?.categories) ? data.categories : []);
    } catch (error) {
      console.error('❌ Failed to fetch P2P categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Check if user is authenticated and is P2P user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    
    // Check userType from localStorage or fetch from API
    const userType = localStorage.getItem('userType');
    if (userType && userType !== 'p2p') {
      // Normal users should not access startup form
      router.push('/dashboard');
      return;
    }
    
    // Fetch user profile to verify userType
    const checkUserType = async () => {
      try {
        const profileData = await getUserProfileApi(token);
        if (profileData.userType && profileData.userType !== 'p2p') {
          // User is not P2P, redirect to dashboard
          router.push('/dashboard');
          return;
        }
        // User is P2P, proceed with startup form
        fetchUserProfile();
        fetchUsers();
      } catch (error) {
        console.error('Error checking user type:', error);
        // If API fails, still try to show form (graceful degradation)
        fetchUserProfile();
        fetchUsers();
      }
    };
    
    checkUserType();
  }, [router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Prevent zoom on mobile input focus
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventZoom);
    };
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleFinishSetup = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Validate form data
    if (!fullName.trim()) {
      showPopup('error', 'Validation Error', 'Please enter your full name');
      return;
    }

    console.log('Saving user data:', {
      avatar: selectedAvatar || '',
      fullName: fullName.trim(),
      bio: bio.trim(),
      location: location.trim()
    });

    setIsLoading(true);
    try {
      await setupUserApi(token, {
        avatar: selectedAvatar || '',
        fullName: fullName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        stepNumber: 2,
        categoryId
      });
      
      console.log('✅ User setup completed successfully');
      showPopup('success', 'Setup Complete!', 'Profile setup completed successfully!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Setup failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      showPopup('error', 'Setup Failed', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get proper avatar URL
  const getAvatarUrl = (url: string | null): string => {
    if (!url) return '/default-avatar.svg';
    
    // If it's already a full URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a default avatar path starting with /, return as is
    if (url.startsWith('/avatars/') || url.startsWith('/default-avatar')) {
      return url;
    }
    
    // Convert local path to full URL
    // Remove backslashes and normalize path
    const cleanUrl = url.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${config.API_URL}/${cleanUrl}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const nextSibling = target.nextSibling as HTMLElement;
    if (nextSibling) {
      nextSibling.style.display = 'flex';
    }
  };

  // Handle file selection for avatar (store file, create preview, but don't upload yet)
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showPopup('error', 'Invalid File', 'Please upload an image file');
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showPopup('error', 'File Too Large', 'Please upload an image smaller than 5MB');
      e.target.value = '';
      return;
    }

    // Store file in state
    setSelectedAvatarFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    
    // Clear any previously selected avatar from list
    setSelectedAvatar(null);
    
    // Reset file input to allow selecting same file again
    e.target.value = '';
  };

  // Upload avatar file (called when Next button is clicked)
  const uploadAvatarFile = async (): Promise<string | null> => {
    if (!selectedAvatarFile) return null;

    const token = localStorage.getItem('token');
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login again');
      return null;
    }

    setUploadingAvatar(true);
    try {
      const response = await uploadProfilePhotoApi(token, selectedAvatarFile);
      if (response.avatar) {
        // Clean up preview URL
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
        }
        setSelectedAvatarFile(null);
        setAvatarPreview(null);
        return response.avatar;
      }
      return null;
    } catch (error: any) {
      console.error('❌ Failed to upload avatar:', error);
      showPopup('error', 'Upload Failed', error.response?.data?.error || error.message || 'Failed to upload photo');
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-0 py-0 flex items-center justify-center min-h-screen">
        <div className={`rounded-xl sm:rounded-2xl shadow-xl flex flex-col lg:flex-row w-full overflow-hidden transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Left Panel */}
          <div className="bg-gray-200 flex flex-col lg:flex-col items-center justify-center lg:justify-between lg:w-1/4 lg:min-w-[200px] p-4 sm:p-6 lg:py-8 lg:px-6">
            <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 text-center mb-4 sm:mb-6 lg:mb-4">
              Follow our famous users.
            </div>
            <div className="hidden lg:flex w-full flex-1 items-end justify-center">
              <Image src="/illustration.svg" alt="illustration" width={120} height={60} />
            </div>
            <div className="lg:hidden flex justify-center">
              <Image src="/illustration.svg" alt="illustration" width={100} height={50} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Mobile Progress Bar */}
            <div className="lg:hidden mb-3 sm:mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-xs text-gray-600">
                Step {step + 1} of {steps.length}
              </div>
            </div>

            {/* Steps */}
            <div className="hidden lg:flex flex-wrap items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
              {steps.map((s, i) => (
                <React.Fragment key={s}>
                  <button
                    className={`px-2 sm:px-4 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                      step === i
                        ? "bg-orange-400 text-white"
                        : step > i
                        ? "bg-orange-200 text-orange-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    onClick={() => setStep(i)}
                  >
                    {s}
                  </button>
                  {i < steps.length - 1 && <span className="text-gray-400 text-xs sm:text-sm">&#9654;</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Step Content */}
            {step === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[350px] lg:min-h-[320px]">
                <div className="mb-4 sm:mb-6 text-gray-700 font-medium text-center text-sm sm:text-base px-2 sm:px-4">
                  Upload your profile media (photo/avatar).
                </div>
                <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-blue-300 relative">
                    {avatarPreview ? (
                      <Image 
                        src={avatarPreview} 
                        alt="avatar preview" 
                        width={96} 
                        height={96}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : selectedAvatar ? (
                      <Image 
                        src={getAvatarUrl(selectedAvatar)} 
                        alt="avatar" 
                        width={96} 
                        height={96}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : null}
                    {!selectedAvatar && !avatarPreview && (
                      <span className="text-gray-400 text-xs sm:text-sm text-center px-2">No avatar selected</span>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {selectedAvatarFile ? 'Change Photo' : 'Select Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileSelect}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                  {selectedAvatarFile && (
                    <div className="text-xs text-green-600 text-center">
                      Photo selected. Click Next to upload.
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 text-center mb-2">Or select from below</div>
                  
                  <div className="w-full flex justify-center">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 sm:gap-3 place-items-center">
                    {defaultAvatars.slice(0, 8).map((avatarPath, i) => (
                      <button
                        key={i}
                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${selectedAvatar === avatarPath ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}
                        onClick={() => {
                          setSelectedAvatar(avatarPath);
                          // Clear file selection if user selects from list
                          if (selectedAvatarFile) {
                            if (avatarPreview) {
                              URL.revokeObjectURL(avatarPreview);
                            }
                            setSelectedAvatarFile(null);
                            setAvatarPreview(null);
                          }
                        }}
                        type="button"
                      >
                        <Image 
                          src={avatarPath} 
                          alt={`Avatar ${i + 1}`} 
                          width={48} 
                          height={48}
                          onError={handleImageError}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600" style={{display: 'none'}}>
                          {i + 1}
                        </div>
                      </button>
                    ))}
                    </div>
                  </div>
                </div>
                <button
                  className="mt-4 sm:mt-6 md:mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 w-full max-w-xs sm:max-w-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    let avatarToSave = selectedAvatar;
                    
                    // If file is selected, upload it first
                    if (selectedAvatarFile) {
                      const uploadedAvatar = await uploadAvatarFile();
                      if (uploadedAvatar) {
                        avatarToSave = uploadedAvatar;
                        setSelectedAvatar(uploadedAvatar);
                      } else {
                        // Upload failed, don't proceed
                        return;
                      }
                    }
                    
                    if (avatarToSave) {
                      const saved = await saveStepData(1, { avatar: avatarToSave }, false);
                      if (saved) {
                        setSavedSteps(prev => ({ ...prev, step1: true }));
                        setStep(1);
                      }
                    } else {
                      showPopup('error', 'Avatar Required', 'Please select an avatar before proceeding');
                    }
                  }}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? 'Uploading...' : 'Next'}
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] lg:min-h-[320px]">
                <div className="mb-4 sm:mb-6 text-gray-700 font-medium text-center text-sm sm:text-base px-2 sm:px-4">
                  Fill in your info to continue.
                </div>
                <form className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col gap-2 sm:gap-3 p-4 px-2 sm:px-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <textarea 
                    placeholder="Bio (Tell us about yourself)" 
                    rows={3}
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Location (City, Country)" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </form>
                <div className="flex gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8 w-full max-w-xs sm:max-w-sm md:max-w-md px-2 sm:px-4">
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
                      if (!fullName.trim()) {
                        showPopup('error', 'Required Fields', 'Please fill in your full name before proceeding');
                        return;
                      }
                      
                      const saved = await saveStepData(2, { 
                        avatar: selectedAvatar, 
                        fullName: fullName.trim(), 
                        bio: bio.trim(), 
                        location: location.trim() 
                      }, false);
                      
                      if (saved) {
                        setSavedSteps(prev => ({ ...prev, step2: true }));
                        setStep(2);
                      }
                    }}
                    disabled={!fullName.trim()}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] lg:min-h-[320px]">
                <div className={`mb-4 sm:mb-6 font-medium text-center text-sm sm:text-base px-2 sm:px-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  About Me
                </div>
                <form className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col gap-2 sm:gap-3 p-4 px-2 sm:px-4">
                  <input 
                    type="number" 
                    placeholder="Work Experience (Years) e.g. 5" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={workExperience}
                    onChange={(e) => setWorkExperience(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Current Organisation e.g. Google" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={currentOrganisation}
                    onChange={(e) => setCurrentOrganisation(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Location e.g. New Delhi" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={aboutMeLocation}
                    onChange={(e) => setAboutMeLocation(e.target.value)}
                  />
                  <div>
                    <textarea 
                      placeholder="Description Max 200 chars - I can help with..." 
                      rows={4}
                      maxLength={200}
                      className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className={`text-xs mt-1 text-right ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {description.length}/200
                    </div>
                  </div>
                </form>
                <div className="flex flex-col gap-3 sm:gap-4 mt-2 sm:mt-3 w-full max-w-xs sm:max-w-sm md:max-w-md px-2 sm:px-4">
                  <div className="text-center">
                    <span className="text-xs sm:text-sm text-gray-500">
                      Or <button 
                        className="underline hover:text-blue-600 transition-colors duration-200"
                        onClick={async () => {
                          // Clear local state when skipping
                          setWorkExperience('');
                          setCurrentOrganisation('');
                          setAboutMeLocation('');
                          setDescription('');
                          
                          const saved = await saveStepData(3, { 
                            avatar: selectedAvatar, 
                            fullName: fullName.trim(), 
                            bio: bio.trim(), 
                            location: location.trim(),
                            workExperience: '',
                            currentOrganisation: '',
                            aboutMeLocation: '',
                            description: ''
                          }, true);
                          
                          if (saved) {
                            setSavedSteps(prev => ({ ...prev, step3: true }));
                            setStep(3);
                          }
                        }}
                      >
                        Skip this step for now.
                      </button>
                    </span>
                  </div>
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <button
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={async () => {
                        const saved = await saveStepData(3, { 
                          avatar: selectedAvatar, 
                          fullName: fullName.trim(), 
                          bio: bio.trim(), 
                          location: location.trim(),
                          workExperience: workExperience.trim(),
                          currentOrganisation: currentOrganisation.trim(),
                          aboutMeLocation: aboutMeLocation.trim(),
                          description: description.trim()
                        }, false);
                        
                        if (saved) {
                          setSavedSteps(prev => ({ ...prev, step3: true }));
                          setStep(3);
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] lg:min-h-[320px]">
                <div className={`mb-4 sm:mb-6 font-medium text-center text-sm sm:text-base px-2 sm:px-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  My Expertise
                </div>
                <div className={`mb-2 sm:mb-3 text-xs sm:text-sm text-center px-2 sm:px-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Areas of Expertise Max 7 tags
                </div>
                <form className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col gap-2 sm:gap-3 p-4 px-2 sm:px-4">
                  <input 
                    type="text" 
                    placeholder="e.g. Coding, Marketing" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={areasOfExpertise}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAreasOfExpertise(value);
                      // Parse comma-separated tags
                      const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                      if (tags.length <= 7) {
                        setExpertiseTags(tags);
                      }
                    }}
                  />
                  {expertiseTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {expertiseTags.map((tag, index) => (
                        <span 
                          key={index}
                          className={`px-3 py-1 rounded-full text-xs sm:text-sm ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {expertiseTags.length >= 7 && (
                    <div className={`text-xs mt-1 text-center ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Maximum 7 tags reached
                    </div>
                  )}
                  <div className="mt-2">
                    <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Select a primary category
                    </label>
                    {categoriesLoading ? (
                      <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Loading categories...
                      </div>
                    ) : (
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        disabled={!categories.length}
                      >
                        <option value="">
                          {categories.length ? 'Choose a category' : 'Categories unavailable'}
                        </option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                    )}
                    {!categories.length && !categoriesLoading && (
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Categories will appear once an admin creates them.
                      </p>
                    )}
                  </div>
                </form>
                <div className="flex flex-col gap-3 sm:gap-4 mt-2 sm:mt-3 w-full max-w-xs sm:max-w-sm md:max-w-md px-2 sm:px-4">
                  <div className="text-center">
                    <span className="text-xs sm:text-sm text-gray-500">
                      Or <button 
                        className="underline hover:text-blue-600 transition-colors duration-200"
                        onClick={async () => {
                          // Clear local state when skipping
                          setAreasOfExpertise('');
                          setExpertiseTags([]);
                          
                          const saved = await saveStepData(4, { 
                            avatar: selectedAvatar, 
                            fullName: fullName.trim(), 
                            bio: bio.trim(), 
                            location: location.trim(),
                            workExperience: workExperience.trim(),
                            currentOrganisation: currentOrganisation.trim(),
                            aboutMeLocation: aboutMeLocation.trim(),
                            description: description.trim(),
                            areasOfExpertise: [],
                            categoryId: categoryId || ''
                          }, true);
                          
                          if (saved) {
                            setSavedSteps(prev => ({ ...prev, step4: true }));
                            setStep(4);
                          }
                        }}
                      >
                        Skip this step for now.
                      </button>
                    </span>
                  </div>
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <button
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </button>
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={async () => {
                        const saved = await saveStepData(4, { 
                          avatar: selectedAvatar, 
                          fullName: fullName.trim(), 
                          bio: bio.trim(), 
                          location: location.trim(),
                          workExperience: workExperience.trim(),
                          currentOrganisation: currentOrganisation.trim(),
                          aboutMeLocation: aboutMeLocation.trim(),
                          description: description.trim(),
                          areasOfExpertise: expertiseTags,
                          categoryId: categoryId
                        }, false);
                        
                        if (saved) {
                          setSavedSteps(prev => ({ ...prev, step4: true }));
                          setStep(4);
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] lg:min-h-[320px]">
                <div className={`mb-4 sm:mb-6 font-medium text-center text-sm sm:text-base px-2 sm:px-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Pricing Details
                </div>
                <form className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col gap-2 sm:gap-3 p-4 px-2 sm:px-4">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder={`Per Hour Rate (${currency === 'USD' ? '$' : '₹'}/hr) e.g. ${currency === 'USD' ? '100' : '1000'}`}
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder={`Audio Call Rate (multiplier) e.g. 12`}
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={audioCallPrice}
                    onChange={(e) => setAudioCallPrice(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder={`Video Call Rate (multiplier) e.g. 15`}
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={videoCallPrice}
                    onChange={(e) => setVideoCallPrice(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder={`Chat Rate (multiplier) e.g. 10`}
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={chatPrice}
                    onChange={(e) => setChatPrice(e.target.value)}
                  />
                </form>
                <div className="flex flex-col gap-3 sm:gap-4 mt-2 sm:mt-3 w-full max-w-xs sm:max-w-sm md:max-w-md px-2 sm:px-4">
                  <div className="text-center">
                    <span className="text-xs sm:text-sm text-gray-500">
                      Or <button 
                        className="underline hover:text-blue-600 transition-colors duration-200"
                        onClick={async () => {
                          // Clear local state when skipping
                          setAudioCallPrice('');
                          setVideoCallPrice('');
                          setChatPrice('');
                          setHourlyRate('');
                          
                          const saved = await saveStepData(5, { 
                            avatar: selectedAvatar, 
                            fullName: fullName.trim(), 
                            bio: bio.trim(), 
                            location: location.trim(),
                            workExperience: workExperience.trim(),
                            currentOrganisation: currentOrganisation.trim(),
                            aboutMeLocation: aboutMeLocation.trim(),
                            description: description.trim(),
                            areasOfExpertise: expertiseTags,
                            audioCallPrice: '',
                            videoCallPrice: '',
                            chatPrice: '',
                            hourlyRate: '',
                            currency: currency
                          }, true);
                          
                          if (saved) {
                            setSavedSteps(prev => ({ ...prev, step5: true }));
                            setStep(5);
                          }
                        }}
                      >
                        Skip this step for now.
                      </button>
                    </span>
                  </div>
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <button
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={() => setStep(3)}
                    >
                      Back
                    </button>
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={async () => {
                        const saved = await saveStepData(5, { 
                          avatar: selectedAvatar, 
                          fullName: fullName.trim(), 
                          bio: bio.trim(), 
                          location: location.trim(),
                          workExperience: workExperience.trim(),
                          currentOrganisation: currentOrganisation.trim(),
                          aboutMeLocation: aboutMeLocation.trim(),
                          description: description.trim(),
                          areasOfExpertise: expertiseTags,
                          audioCallPrice: audioCallPrice.trim(),
                          videoCallPrice: videoCallPrice.trim(),
                          chatPrice: chatPrice.trim(),
                          hourlyRate: hourlyRate.trim(),
                          currency: currency
                        }, false);
                        
                        if (saved) {
                          setSavedSteps(prev => ({ ...prev, step5: true }));
                          setStep(5);
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] lg:min-h-[320px]">
                <div className={`mb-4 sm:mb-6 font-medium text-center text-sm sm:text-base px-2 sm:px-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Available Time
                </div>
                <form className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col gap-2 sm:gap-3 p-4 px-2 sm:px-4">
                  <div className="mb-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Select Available Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (availableDays.includes(day)) {
                              setAvailableDays(availableDays.filter(d => d !== day));
                            } else {
                              setAvailableDays([...availableDays, day]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                            availableDays.includes(day)
                              ? 'bg-blue-600 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input 
                    type="time" 
                    placeholder="Available From Time e.g. 09:00" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={availableFromTime}
                    onChange={(e) => setAvailableFromTime(e.target.value)}
                  />
                  <input 
                    type="time" 
                    placeholder="Available To Time e.g. 18:00" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={availableToTime}
                    onChange={(e) => setAvailableToTime(e.target.value)}
                  />
                </form>
                <div className="flex flex-col gap-3 sm:gap-4 mt-2 sm:mt-3 w-full max-w-xs sm:max-w-sm md:max-w-md px-2 sm:px-4">
                  <div className="text-center">
                    <span className="text-xs sm:text-sm text-gray-500">
                      Or <button 
                        className="underline hover:text-blue-600 transition-colors duration-200"
                        onClick={async () => {
                          // Clear local state when skipping
                          setAvailableFromTime('');
                          setAvailableToTime('');
                          setAvailableDays([]);
                          
                          const saved = await saveStepData(6, { 
                            avatar: selectedAvatar, 
                            fullName: fullName.trim(), 
                            bio: bio.trim(), 
                            location: location.trim(),
                            workExperience: workExperience.trim(),
                            currentOrganisation: currentOrganisation.trim(),
                            aboutMeLocation: aboutMeLocation.trim(),
                            description: description.trim(),
                            areasOfExpertise: expertiseTags,
                            audioCallPrice: audioCallPrice.trim(),
                            videoCallPrice: videoCallPrice.trim(),
                            chatPrice: chatPrice.trim(),
                            currency: currency,
                            availableFromTime: '',
                            availableToTime: '',
                            availableDays: []
                          }, true);
                          
                          if (saved) {
                            setSavedSteps(prev => ({ ...prev, step6: true }));
                            setStep(6);
                          }
                        }}
                      >
                        Skip this step for now.
                      </button>
                    </span>
                  </div>
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <button
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={() => setStep(4)}
                    >
                      Back
                    </button>
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={async () => {
                        const saved = await saveStepData(6, { 
                          avatar: selectedAvatar, 
                          fullName: fullName.trim(), 
                          bio: bio.trim(), 
                          location: location.trim(),
                          workExperience: workExperience.trim(),
                          currentOrganisation: currentOrganisation.trim(),
                          aboutMeLocation: aboutMeLocation.trim(),
                          description: description.trim(),
                          areasOfExpertise: expertiseTags,
                          audioCallPrice: audioCallPrice.trim(),
                          videoCallPrice: videoCallPrice.trim(),
                          chatPrice: chatPrice.trim(),
                          currency: currency,
                          availableFromTime: availableFromTime.trim(),
                          availableToTime: availableToTime.trim(),
                          availableDays: availableDays
                        }, false);
                        
                        if (saved) {
                          setSavedSteps(prev => ({ ...prev, step6: true }));
                          setStep(6);
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] lg:min-h-[320px]">
                <div className={`mb-4 sm:mb-6 font-medium text-center text-sm sm:text-base px-2 sm:px-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Social Media Links
                </div>
                <form className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col gap-2 sm:gap-3 p-4 px-2 sm:px-4">
                  <input 
                    type="url" 
                    placeholder="LinkedIn - Add link" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={linkedInLink}
                    onChange={(e) => setLinkedInLink(e.target.value)}
                  />
                  <input 
                    type="url" 
                    placeholder="Instagram - Add link" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                  />
                  <input 
                    type="url" 
                    placeholder="Twitter - Add link" 
                    className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    value={twitterLink}
                    onChange={(e) => setTwitterLink(e.target.value)}
                  />
                </form>
                <div className="flex flex-col gap-3 sm:gap-4 mt-2 sm:mt-3 w-full max-w-xs sm:max-w-sm md:max-w-md px-2 sm:px-4">
                  <div className="text-center">
                    <span className="text-xs sm:text-sm text-gray-500">
                      Or <button 
                        className="underline hover:text-blue-600 transition-colors duration-200"
                        onClick={async () => {
                          // Clear local state when skipping
                          setLinkedInLink('');
                          setInstagramLink('');
                          setTwitterLink('');
                          
                          const saved = await saveStepData(7, { 
                            avatar: selectedAvatar, 
                            fullName: fullName.trim(), 
                            bio: bio.trim(), 
                            location: location.trim(),
                            workExperience: workExperience.trim(),
                            currentOrganisation: currentOrganisation.trim(),
                            aboutMeLocation: aboutMeLocation.trim(),
                            description: description.trim(),
                            areasOfExpertise: expertiseTags,
                            audioCallPrice: audioCallPrice.trim(),
                            videoCallPrice: videoCallPrice.trim(),
                            chatPrice: chatPrice.trim(),
                            currency: currency,
                            linkedInLink: '',
                            instagramLink: '',
                            twitterLink: '',
                            availableFromTime: availableFromTime.trim(),
                            availableToTime: availableToTime.trim()
                          }, true);
                          
                          if (saved) {
                            setSavedSteps(prev => ({ ...prev, step7: true }));
                            setStep(7);
                          }
                        }}
                      >
                        Skip this step for now.
                      </button>
                    </span>
                  </div>
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <button
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={() => setStep(5)}
                    >
                      Back
                    </button>
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={async () => {
                        // Follow selected users first
                        if (selectedUsersToFollow.size > 0) {
                          setFollowingUsers(true);
                          const token = localStorage.getItem('token');
                          if (token) {
                            const followPromises = Array.from(selectedUsersToFollow).map(async (userId) => {
                              try {
                                await followUserApi(token, userId);
                                return { success: true, userId };
                              } catch (error) {
                                console.error(`Failed to follow user ${userId}:`, error);
                                return { success: false, userId };
                              }
                            });
                            
                            await Promise.all(followPromises);
                            console.log(`✅ Followed ${selectedUsersToFollow.size} users`);
                          }
                          setFollowingUsers(false);
                        }
                        
                        const saved = await saveStepData(7, { 
                          avatar: selectedAvatar, 
                          fullName: fullName.trim(), 
                          bio: bio.trim(), 
                          location: location.trim(),
                          workExperience: workExperience.trim(),
                          currentOrganisation: currentOrganisation.trim(),
                          aboutMeLocation: aboutMeLocation.trim(),
                          description: description.trim(),
                          areasOfExpertise: expertiseTags,
                          audioCallPrice: audioCallPrice.trim(),
                          videoCallPrice: videoCallPrice.trim(),
                          chatPrice: chatPrice.trim(),
                          currency: currency,
                          linkedInLink: linkedInLink.trim(),
                          instagramLink: instagramLink.trim(),
                          twitterLink: twitterLink.trim(),
                          availableFromTime: availableFromTime.trim(),
                          availableToTime: availableToTime.trim()
                        }, false);
                        
                        if (saved) {
                          setSavedSteps(prev => ({ ...prev, step7: true }));
                          setStep(8);
                        }
                      }}
                      disabled={followingUsers}
                    >
                      {followingUsers ? `Following ${selectedUsersToFollow.size}...` : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 7 && (
              <>
                <div className="text-center mb-3 sm:mb-4 md:mb-6 text-gray-700 font-medium text-sm sm:text-base px-2 sm:px-4">
                  Get latest activities from our popular users.
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6 px-1 sm:px-2 max-h-[250px] sm:max-h-[300px] md:max-h-[400px] overflow-y-auto">
                  {usersLoading ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={`flex flex-col items-center border rounded-lg p-1 sm:p-2 md:p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} animate-pulse`}>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-gray-300 mb-1 sm:mb-2"></div>
                        <div className="w-16 h-3 bg-gray-300 rounded"></div>
                      </div>
                    ))
                  ) : (
                    users.map((user: any, i) => {
                      const userId = user.userId || user._id || user.id;
                      const isSelected = selectedUsersToFollow.has(userId);
                      return (
                      <button 
                        key={userId || i} 
                        onClick={() => {
                          const newSelected = new Set(selectedUsersToFollow);
                          if (isSelected) {
                            newSelected.delete(userId);
                          } else {
                            newSelected.add(userId);
                          }
                          setSelectedUsersToFollow(newSelected);
                        }}
                        className={`flex flex-col items-center border rounded-lg p-1 sm:p-2 md:p-3 relative transition-all duration-200 hover:scale-105 active:scale-95 ${
                          isSelected 
                            ? isDarkMode ? 'bg-blue-900 border-blue-500 ring-2 ring-blue-400' : 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                            : isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-blue-50'
                        }`}
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-gray-100 mb-1 sm:mb-2 flex items-center justify-center relative">
                          <Image 
                            src={getAvatarUrl(user.img || user.avatar)} 
                            alt={user.name || user.fullName || 'User'} 
                            width={56} 
                            height={56}
                            onError={handleImageError}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600" style={{display: 'none'}}>
                            {(user.name || user.fullName || 'U').charAt(0)}
                          </div>
                          {user.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                          {user.isVerified && (
                            <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <span className={`text-xs sm:text-sm font-medium truncate w-full text-center px-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {user.name || user.fullName || user.username || 'User'}
                        </span>
                        {user.bio && (
                          <span className={`text-xs truncate w-full text-center px-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} title={user.bio}>
                            {user.bio.length > 15 ? user.bio.substring(0, 15) + '...' : user.bio}
                          </span>
                        )}
                      </button>
                    );
                    })
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-0 mt-2 sm:mt-3 md:mt-2 px-1 sm:px-2">
                  <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left sm:pl-1">
                      Or <button 
                      className="underline hover:text-blue-600 transition-colors duration-200"
                      onClick={async () => {
                        // Skip step 8 and complete setup
                        const saved = await saveStepData(8, { 
                          avatar: selectedAvatar, 
                          fullName: fullName.trim(), 
                          bio: bio.trim(), 
                          location: location.trim(),
                          workExperience: workExperience.trim(),
                          currentOrganisation: currentOrganisation.trim(),
                          aboutMeLocation: aboutMeLocation.trim(),
                          description: description.trim(),
                          areasOfExpertise: expertiseTags,
                          audioCallPrice: audioCallPrice.trim(),
                          videoCallPrice: videoCallPrice.trim(),
                          chatPrice: chatPrice.trim(),
                          currency: currency,
                          linkedInLink: linkedInLink.trim(),
                          instagramLink: instagramLink.trim(),
                          twitterLink: twitterLink.trim(),
                          availableFromTime: availableFromTime.trim(),
                          availableToTime: availableToTime.trim()
                        }, true);
                        
                        if (saved) {
                          setSavedSteps(prev => ({ ...prev, step8: true }));
                          setStep(8);
                        }
                      }}
                    >
                      Skip this step for now.
                    </button>
                  </span>
                  <button 
                    onClick={async () => {
                      // Follow selected users first
                      if (selectedUsersToFollow.size > 0) {
                        setFollowingUsers(true);
                        const token = localStorage.getItem('token');
                        if (token) {
                          const followPromises = Array.from(selectedUsersToFollow).map(async (userId) => {
                            try {
                              await followUserApi(token, userId);
                              return { success: true, userId };
                            } catch (error) {
                              console.error(`Failed to follow user ${userId}:`, error);
                              return { success: false, userId };
                            }
                          });
                          
                          await Promise.all(followPromises);
                          console.log(`✅ Followed ${selectedUsersToFollow.size} users`);
                        }
                        setFollowingUsers(false);
                      }
                      
                      // Complete step 8 with following users
                      const saved = await saveStepData(8, { 
                        avatar: selectedAvatar, 
                        fullName: fullName.trim(), 
                        bio: bio.trim(), 
                        location: location.trim(),
                          workExperience: workExperience.trim(),
                          currentOrganisation: currentOrganisation.trim(),
                          aboutMeLocation: aboutMeLocation.trim(),
                          description: description.trim(),
                          areasOfExpertise: expertiseTags,
                          audioCallPrice: audioCallPrice.trim(),
                          videoCallPrice: videoCallPrice.trim(),
                          chatPrice: chatPrice.trim(),
                          currency: currency,
                          linkedInLink: linkedInLink.trim(),
                          instagramLink: instagramLink.trim(),
                          twitterLink: twitterLink.trim(),
                          availableFromTime: availableFromTime.trim(),
                          availableToTime: availableToTime.trim()
                      }, false);
                      
                      if (saved) {
                        setSavedSteps(prev => ({ ...prev, step8: true }));
                        setStep(8);
                      }
                    }}
                    disabled={isLoading || followingUsers}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {followingUsers ? `Following ${selectedUsersToFollow.size}...` : isLoading ? 'Setting up...' : selectedUsersToFollow.size > 0 ? `Follow ${selectedUsersToFollow.size} & Next` : 'Follow 20 & Next'}
                  </button>
                </div>
              </>
            )}

            {step === 8 && (
              <>
                <div className="text-center mb-3 sm:mb-4 md:mb-6 text-gray-700 font-medium text-sm sm:text-base px-2 sm:px-4">
                  Follow advisors to get expert guidance.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6 px-1 sm:px-2 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto">
                  {usersLoading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={`border rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} animate-pulse`}>
                        <div className="flex flex-col items-center mb-3">
                          <div className="w-16 h-16 rounded-full bg-gray-300 mb-2"></div>
                          <div className="w-24 h-4 bg-gray-300 rounded mb-1"></div>
                          <div className="w-32 h-3 bg-gray-300 rounded"></div>
                        </div>
                        <div className="w-full h-3 bg-gray-300 rounded mb-2"></div>
                        <div className="w-3/4 h-3 bg-gray-300 rounded mb-3"></div>
                        <div className="flex gap-2 mb-3">
                          <div className="w-16 h-6 bg-gray-300 rounded"></div>
                          <div className="w-20 h-6 bg-gray-300 rounded"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 h-8 bg-gray-300 rounded"></div>
                          <div className="flex-1 h-8 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    users.map((user: any, i) => {
                      const userId = user.userId || user._id || user.id;
                      const isSelected = selectedUsersToFollow.has(userId);
                      return (
                      <div 
                        key={userId || i} 
                        onClick={() => {
                          const newSelected = new Set(selectedUsersToFollow);
                          if (isSelected) {
                            newSelected.delete(userId);
                          } else {
                            newSelected.add(userId);
                          }
                          setSelectedUsersToFollow(newSelected);
                        }}
                        className={`border rounded-lg p-3 sm:p-4 cursor-pointer relative transition-all duration-200 hover:shadow-lg ${
                          isSelected 
                            ? isDarkMode ? 'bg-blue-900 border-blue-500 ring-2 ring-blue-400' : 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                            : isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:shadow-lg'
                        }`}
                      >
                        {/* Profile Photo */}
                        <div className="flex flex-col items-center mb-3">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-100 mb-2 flex items-center justify-center">
                            <Image 
                              src={getAvatarUrl(user.img || user.avatar)} 
                              alt={user.name || user.fullName || 'Advisor'} 
                              width={80} 
                              height={80}
                              onError={handleImageError}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-lg text-gray-600" style={{display: 'none'}}>
                              {(user.name || user.fullName || 'A').charAt(0)}
                            </div>
                          </div>
                          <h3 className={`font-semibold text-sm sm:text-base mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.name || user.fullName || 'Advisor'}
                          </h3>
                          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                            {user.bio || user.occupation || 'Expert Advisor'}
                          </p>
                        </div>

                        {/* Description */}
                        {(user.description || user.bio) && (
                          <p className={`text-xs sm:text-sm mb-3 text-center line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {user.description || user.bio || 'I can help with business guidance and expert advice.'}
                          </p>
                        )}

                        {/* Tags */}
                        {(user.areasOfExpertise || user.expertise || user.tags) && (
                          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center mb-3">
                            {(user.areasOfExpertise || user.expertise || user.tags || []).slice(0, 3).map((tag: string, idx: number) => (
                              <span 
                                key={idx}
                                className={`px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Prices */}
                        <div className="flex flex-col gap-2">
                          {(user.audioCallPrice || user.audioPrice) && (
                            <button className={`w-full py-2 px-3 rounded-lg text-xs sm:text-sm font-medium ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition-colors`}>
                              ₹{user.audioCallPrice || user.audioPrice}/hr Audio
                            </button>
                          )}
                          <div className="flex gap-2">
                            {(user.videoCallPrice || user.videoPrice) && (
                              <button className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition-colors`}>
                                ₹{user.videoCallPrice || user.videoPrice}/hr Video
                              </button>
                            )}
                            {(user.chatPrice) && (
                              <button className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition-colors`}>
                                ₹{user.chatPrice} Chat
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                    })
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-0 mt-2 sm:mt-3 md:mt-2 px-1 sm:px-2">
                  <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left sm:pl-1">
                    Or <button 
                      className="underline hover:text-blue-600 transition-colors duration-200"
                      onClick={async () => {
                        // Skip step 9 and complete setup
                        const saved = await saveStepData(9, { 
                          avatar: selectedAvatar, 
                          fullName: fullName.trim(), 
                          bio: bio.trim(), 
                          location: location.trim(),
                          workExperience: workExperience.trim(),
                          currentOrganisation: currentOrganisation.trim(),
                          aboutMeLocation: aboutMeLocation.trim(),
                          description: description.trim(),
                          areasOfExpertise: expertiseTags,
                          audioCallPrice: audioCallPrice.trim(),
                          videoCallPrice: videoCallPrice.trim(),
                          chatPrice: chatPrice.trim(),
                          currency: currency,
                          linkedInLink: linkedInLink.trim(),
                          instagramLink: instagramLink.trim(),
                          twitterLink: twitterLink.trim(),
                          availableFromTime: availableFromTime.trim(),
                          availableToTime: availableToTime.trim()
                        }, true);
                        
                        if (saved) {
                          setSavedSteps(prev => ({ ...prev, step9: true }));
                          alert('Profile setup completed! You can follow advisors later.');
                          router.push('/dashboard');
                        }
                      }}
                    >
                      Skip this step for now.
                    </button>
                  </span>
                  <button 
                    onClick={async () => {
                      // Follow selected advisors first
                      if (selectedUsersToFollow.size > 0) {
                        setFollowingUsers(true);
                        const token = localStorage.getItem('token');
                        if (token) {
                          const followPromises = Array.from(selectedUsersToFollow).map(async (userId) => {
                            try {
                              await followUserApi(token, userId);
                              return { success: true, userId };
                            } catch (error) {
                              console.error(`Failed to follow user ${userId}:`, error);
                              return { success: false, userId };
                            }
                          });
                          
                          await Promise.all(followPromises);
                          console.log(`✅ Followed ${selectedUsersToFollow.size} advisors`);
                        }
                        setFollowingUsers(false);
                      }
                      
                      // Complete step 9 with following advisors
                      const saved = await saveStepData(9, { 
                        avatar: selectedAvatar, 
                        fullName: fullName.trim(), 
                        bio: bio.trim(), 
                        location: location.trim(),
                          workExperience: workExperience.trim(),
                          currentOrganisation: currentOrganisation.trim(),
                          aboutMeLocation: aboutMeLocation.trim(),
                          description: description.trim(),
                          areasOfExpertise: expertiseTags,
                          audioCallPrice: audioCallPrice.trim(),
                          videoCallPrice: videoCallPrice.trim(),
                          chatPrice: chatPrice.trim(),
                          currency: currency,
                          linkedInLink: linkedInLink.trim(),
                          instagramLink: instagramLink.trim(),
                          twitterLink: twitterLink.trim(),
                          availableFromTime: availableFromTime.trim(),
                          availableToTime: availableToTime.trim()
                      }, false);
                      
                      if (saved) {
                        setSavedSteps(prev => ({ ...prev, step9: true }));
                        alert('Profile setup completed! Welcome to the community!');
                        router.push('/dashboard');
                      }
                    }}
                    disabled={isLoading || followingUsers}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {followingUsers ? `Following ${selectedUsersToFollow.size}...` : isLoading ? 'Setting up...' : selectedUsersToFollow.size > 0 ? `Follow ${selectedUsersToFollow.size} & Finish` : 'Follow Advisors & Finish'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

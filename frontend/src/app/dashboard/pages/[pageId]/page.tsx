"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Search, Video, Image, Hash, AtSign, Link, Plus, Heart, MessageCircle, Share2, MoreHorizontal, Users, FileText, Diamond, X, Upload, Smile, MapPin, Globe, Edit } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import FeedPost from '@/components/FeedPost';

interface Page {
  _id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar: string;
  profileImage?: string;
  coverImage?: string;
  likes: string[];
  followers: string[];
  posts: string[];
  reviews?: any[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  _id: string;
  content: string;
  media?: any[];
  createdAt: string;
  user: string;
  likes?: string[];
  comments?: any[];
  shares?: string[];
}

interface Job {
  _id: string;
  title: string;
  location: string;
  description: string;
  salaryRange: {
    minimum: number;
    maximum: number;
    currency: string;
    type: string;
  };
  jobType: string;
  category: string;
  questions: Array<{ question: string }>;
  image?: string;
  pageId: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar: string;
  interestedCandidates: Array<{
    userId: string;
    appliedAt: string;
    status: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PageView: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { pageId } = useParams();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [newPostContent, setNewPostContent] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postPrivacy, setPostPrivacy] = useState('public');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyFormData, setApplyFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null,
    answers: [] as string[]
  });
  const [applying, setApplying] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    message: ''
  });
  const [sendingInvite, setSendingInvite] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    location: '',
    description: '',
    salaryRange: {
      minimum: 0,
      maximum: 0,
      currency: 'USD',
      type: 'Per Hour'
    },
    jobType: 'Full time',
    category: 'Other',
    questions: [] as string[]
  });
  const [jobImage, setJobImage] = useState<File | null>(null);
  const [creatingJob, setCreatingJob] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerFormData, setOfferFormData] = useState({
    offerType: 'Discount Percent',
    discountPercent: 1,
    discountedItems: '',
    currency: 'USD',
    description: '',
    endDate: '',
    endTime: ''
  });
  const [offerThumbnail, setOfferThumbnail] = useState<File | null>(null);
  const [creatingOffer, setCreatingOffer] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const tabs = [
    { id: 'Home', label: 'Home' },
    { id: 'Jobs', label: 'Jobs' },
    { id: 'Offers', label: 'Offers' },
    { id: 'Reviews', label: 'Reviews' },
    { id: 'Invite', label: 'Invite' }
  ];

  const postFilters = [
    { id: 'all', label: 'All' },
    { id: 'text', label: 'Text' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
    { id: 'sounds', label: 'Sounds' }
  ];

  useEffect(() => {
    if (pageId) {
      fetchPage();
      fetchPagePosts();
      fetchJobs();
      fetchReviews();
    }
  }, [pageId]);


  // Fetch reviews for the page
  const fetchReviews = async () => {
    try {
      // Try to fetch from API first
      const response = await fetch(`${API_URL}/api/pages/${pageId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        return;
      }
    } catch (error) {
      console.log('Reviews API not available, trying page data...');
    }

    try {
      if (page?.reviews && page.reviews.length > 0) {
        setReviews(page.reviews);
        return;
      }
    } catch (error) {
      console.log('Page reviews not available, trying localStorage...');
    }
    try {
      const storedReviews = JSON.parse(localStorage.getItem('pageReviews') || '[]');
      const pageReviews = storedReviews.filter((review: any) => review.pageId === pageId);
      setReviews(pageReviews);
    } catch (error) {
      console.error('Error loading reviews from localStorage:', error);
      setReviews([]);
    }
  };

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!reviewFormData.comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Try the reviews endpoint first
      let response;
      let reviewSubmitted = false;

      try {
        console.log('Trying reviews endpoint...', { rating: reviewFormData.rating, comment: reviewFormData.comment });
        response = await fetch(`${API_URL}/api/pages/${pageId}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            rating: reviewFormData.rating,
            comment: reviewFormData.comment
          })
        });

        console.log('Reviews response:', response.status, response.statusText);
        if (response.ok) {
          reviewSubmitted = true;
          console.log('Review submitted successfully via reviews endpoint');
        } else {
          const errorText = await response.text();
          console.log('Reviews endpoint error:', errorText);
        }
      } catch (error) {
        console.log('Reviews endpoint not available:', error);
      }

      // If reviews endpoint doesn't work, try adding to page's reviews array
      if (!reviewSubmitted) {
        try {
          console.log('Trying to update page with review...');
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}') as any;
          const newReview = {
            _id: Date.now().toString(),
            rating: reviewFormData.rating,
            comment: reviewFormData.comment,
            user: {
              _id: currentUser._id,
              name: currentUser.name || 'Anonymous User',
              avatar: currentUser.avatar
            },
            createdAt: new Date().toISOString()
          };

          const updateData = {
            reviews: [...(page?.reviews || []), newReview]
          };

          response = await fetch(`${API_URL}/api/pages/${pageId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          });

          console.log('Page update response:', response.status, response.statusText);
          if (response.ok) {
            reviewSubmitted = true;
            console.log('Review submitted successfully via page update');
           
            setPage(prev => prev ? { ...prev, reviews: [...(prev.reviews || []), newReview] } : null);
            setReviews(prev => [...prev, newReview]);
          } else {
            const errorText = await response.text();
            console.log('Page update error:', errorText);
          }
        } catch (error) {
          console.log('Page update also failed:', error);
        }
      }

      // Fallback: Store review in localStorage
      if (!reviewSubmitted) {
        try {
          console.log('Using localStorage fallback...');
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}') as any;
          const newReview = {
            _id: Date.now().toString(),
            rating: reviewFormData.rating,
            comment: reviewFormData.comment,
            user: {
              _id: currentUser._id,
              name: currentUser.name || 'Anonymous User',
              avatar: currentUser.avatar
            },
            createdAt: new Date().toISOString(),
            pageId: pageId
          };

          const reviews = JSON.parse(localStorage.getItem('pageReviews') || '[]');
          reviews.push(newReview);
          localStorage.setItem('pageReviews', JSON.stringify(reviews));
          
          // Update local state
          setReviews(prev => [...prev, newReview]);
          reviewSubmitted = true;
          console.log('Review stored locally');
        } catch (error) {
          console.error('Failed to store review locally:', error);
        }
      }

      if (reviewSubmitted) {
        // Determine which method worked for user feedback
        let successMessage = 'Review submitted successfully!';
        if (response && response.ok) {
          successMessage += ' (Saved to server)';
        } else {
          successMessage += ' (Saved locally)';
        }
        
        alert(successMessage);
        setShowReviewModal(false);
        setReviewFormData({ rating: 5, comment: '' });
        fetchReviews(); // Refresh reviews
      } else {
        alert('Error: Failed to submit review. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred while submitting your review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle invite submission
  const handleInviteSubmit = async () => {
    if (!inviteData.email.trim()) {
      alert('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setSendingInvite(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/api/pages/${pageId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: inviteData.email,
          message: inviteData.message,
          pageName: page?.name || 'this page'
        })
      });

      if (response.ok) {
        alert('Invitation sent successfully!');
        setShowInviteModal(false);
        setInviteData({ email: '', message: '' });
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to send invitation'));
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      // Fallback: Use native share or copy link
      const shareData = {
        title: `Check out ${page?.name || 'this page'}`,
        text: inviteData.message || `Check out this page: ${page?.name || 'Amazing Page'}`,
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
          alert('Invitation shared successfully!');
        } else {
          await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
          alert('Page link copied to clipboard!');
        }
        setShowInviteModal(false);
        setInviteData({ email: '', message: '' });
      } catch (shareError) {
        alert('Failed to send invitation. Please try again.');
      }
    } finally {
      setSendingInvite(false);
    }
  };

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPage(data);
      } else {
        console.error('Failed to fetch page');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPagePosts = async () => {
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/pages/${pageId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching page posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPostContent,
          pageId: pageId
        })
      });

      if (response.ok) {
        setNewPostContent('');
        fetchPagePosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleCreatePostWithModal = async () => {
    if (!postContent.trim() && mediaFiles.length === 0) {
      alert('Please add some content or media to your post');
      return;
    }

    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const formData = new FormData();
      formData.append('content', postContent);
      
      if (postTitle.trim()) {
        formData.append('title', postTitle.trim());
      }
      
      if (pageId) {
        formData.append('pageId', pageId as string);
      }
      
      formData.append('privacy', postPrivacy);
      
      if (selectedLocation) {
        formData.append('location', selectedLocation);
      }
      
      if (selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(selectedTags));
      }
      
      mediaFiles.forEach((file, index) => {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`File "${file.name}" has an unsupported format. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, OGG).`);
        }
        
        formData.append('media', file);
      });

  const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const post = await response.json();
        console.log('Post created successfully:', post);
        
        // Reset form
        setPostTitle('');
        setPostContent('');
        setPostPrivacy('public');
        setMediaFiles([]);
        setSelectedLocation('');
        setSelectedTags([]);
        setShowPostModal(false);
        
        // Refresh posts
        fetchPagePosts();
        
        alert('Post created successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Failed to create post'));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('An error occurred while creating the post');
      }
    } finally {
      setPosting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!selectedTags.includes(tagInput.trim())) {
        setSelectedTags(prev => [...prev, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/jobs/page/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleCreateJob = async () => {
    if (!jobFormData.title || !jobFormData.location || !jobFormData.description) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate salary range
    if (jobFormData.salaryRange.minimum < 0 || jobFormData.salaryRange.maximum < 0) {
      alert('Salary values must be positive numbers');
      return;
    }

    if (jobFormData.salaryRange.minimum > jobFormData.salaryRange.maximum) {
      alert('Minimum salary cannot be greater than maximum salary');
      return;
    }

    setCreatingJob(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Prepare the job data according to the backend schema
      const jobData: any = {
        title: jobFormData.title,
        location: jobFormData.location,
        description: jobFormData.description,
        salaryRange: {
          minimum: Number(jobFormData.salaryRange.minimum),
          maximum: Number(jobFormData.salaryRange.maximum),
          currency: jobFormData.salaryRange.currency,
          type: jobFormData.salaryRange.type
        },
        jobType: jobFormData.jobType,
        category: jobFormData.category,
        questions: jobFormData.questions.filter(q => q.trim() !== '').map(q => ({ question: q })), // Convert to proper format and filter empty questions
        pageId: pageId as string
      };

      // If there's an image, upload it first
      let imageUrl = null;
      if (jobImage) {
        const imageFormData = new FormData();
        imageFormData.append('postMedia', jobImage);

  const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.media[0].url;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Add image URL to job data if available
      if (imageUrl) {
        jobData.image = imageUrl;
      }

      // Debug: Log the data being sent
      console.log('Sending job data:', jobData);

  const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        const job = await response.json();
        console.log('Job created successfully:', job);
        
        // Reset form
        setJobFormData({
          title: '',
          location: '',
          description: '',
          salaryRange: {
            minimum: 0,
            maximum: 0,
            currency: 'USD',
            type: 'Per Hour'
          },
          jobType: 'Full time',
          category: 'Other',
          questions: []
        });
        setJobImage(null);
        setShowJobModal(false);
        
        // Refresh jobs
        fetchJobs();
        
        alert('Job created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Job creation failed:', errorData);
        alert('Error: ' + (errorData.message || errorData.error || 'Failed to create job'));
      }
    } catch (error) {
      console.error('Error creating job:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('An error occurred while creating the job');
      }
    } finally {
      setCreatingJob(false);
    }
  };

  // Handle edit job
  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title,
      location: job.location,
      description: job.description,
      salaryRange: {
        minimum: job.salaryRange.minimum,
        maximum: job.salaryRange.maximum,
        currency: job.salaryRange.currency,
        type: job.salaryRange.type
      },
      jobType: job.jobType,
      category: job.category,
      questions: job.questions.map(q => q.question)
    });
    setJobImage(null); // Reset image
    setShowJobModal(true);
  };

  // Handle delete job
  const handleDeleteJob = (jobId: string) => {
    setJobToDelete(jobId);
    setShowDeleteConfirm(true);
  };

  // Handle job card click
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  // Handle apply button click
  const handleApplyClick = () => {
    if (!selectedJob) return;
    
    // Initialize answers array with empty strings for each question
    const answers = new Array(selectedJob.questions.length).fill('');
    setApplyFormData(prev => ({
      ...prev,
      answers
    }));
    setShowApplyModal(true);
  };

  // Handle share button click
  const handleShareClick = async () => {
    if (!selectedJob) return;

    const shareData = {
      title: selectedJob.title,
      text: `Check out this job: ${selectedJob.title} at ${page?.name || 'this company'}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Job link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Job link copied to clipboard!');
      } catch (clipboardError) {
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  // Handle apply form submission
  const handleApplySubmit = async () => {
    if (!selectedJob) return;

    // Validate required fields
    if (!applyFormData.name.trim() || !applyFormData.email.trim() || !applyFormData.phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applyFormData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Prepare application data
      const applicationData: any = {
        jobId: selectedJob._id,
        name: applyFormData.name,
        email: applyFormData.email,
        phone: applyFormData.phone,
        coverLetter: applyFormData.coverLetter,
        answers: selectedJob.questions.map((question, index) => ({
          question: question.question,
          answer: applyFormData.answers[index] || ''
        }))
      };

      // If there's a resume, upload it first
      let resumeUrl = null;
      if (applyFormData.resume) {
        const formData = new FormData();
        formData.append('postMedia', applyFormData.resume);

        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          resumeUrl = uploadData.media[0].url;
        } else {
          throw new Error('Failed to upload resume');
        }
      }

      // Add resume URL to application data
      if (resumeUrl) {
        applicationData['resume'] = resumeUrl;
      }

      // Submit application - try multiple endpoints
      let response;
      let applicationSubmitted = false;

      // Try the applications endpoint first
      try {
        console.log('Trying applications endpoint...', applicationData);
        response = await fetch(`${API_URL}/api/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(applicationData)
        });

        console.log('Applications response:', response.status, response.statusText);
        if (response.ok) {
          applicationSubmitted = true;
          console.log('Application submitted successfully via applications endpoint');
        } else {
          const errorText = await response.text();
          console.log('Applications endpoint error:', errorText);
        }
      } catch (error) {
        console.log('Applications endpoint not available:', error);
      }

      // If applications endpoint doesn't work, try adding to job's interestedCandidates
      if (!applicationSubmitted) {
        try {
          console.log('Trying jobs endpoint...');
          // Add current user to interested candidates
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}') as any;
          const updateData = {
            interestedCandidates: [...(selectedJob.interestedCandidates || []), currentUser._id]
          };

          console.log('Updating job with data:', updateData);
          response = await fetch(`${API_URL}/api/jobs/${selectedJob._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          });

          console.log('Jobs response:', response.status, response.statusText);
          if (response.ok) {
            applicationSubmitted = true;
            console.log('Application submitted successfully via jobs endpoint');
            // Update local state
            setJobs(prev => prev.map(job => 
              job._id === selectedJob._id 
                ? { ...job, interestedCandidates: [...(job.interestedCandidates || []), currentUser._id] }
                : job
            ));
          } else {
            const errorText = await response.text();
            console.log('Jobs endpoint error:', errorText);
          }
        } catch (error) {
          console.log('Jobs endpoint also failed:', error);
        }
      }

      // Fallback: Store application in localStorage
      if (!applicationSubmitted) {
        try {
          const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
          applications.push({
            ...applicationData,
            id: Date.now().toString(),
            appliedAt: new Date().toISOString(),
            jobTitle: selectedJob.title,
            companyName: page?.name || 'Unknown Company'
          });
          localStorage.setItem('jobApplications', JSON.stringify(applications));
          applicationSubmitted = true;
        } catch (error) {
          console.error('Failed to store application locally:', error);
        }
      }

      if (applicationSubmitted) {
        // Determine which method worked for user feedback
        let successMessage = 'Application submitted successfully!';
        if (response && response.ok) {
          successMessage += ' (Saved to server)';
        } else {
          successMessage += ' (Saved locally)';
        }
        
        alert(successMessage);
        setShowApplyModal(false);
        setShowJobDetail(false);
        setSelectedJob(null);
        
        // Reset form
        setApplyFormData({
          name: '',
          email: '',
          phone: '',
          coverLetter: '',
          resume: null,
          answers: []
        });
      } else {
        alert('Error: Failed to submit application. Please check your internet connection and try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('An error occurred while submitting your application');
    } finally {
      setApplying(false);
    }
  };

  // Confirm delete job
  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/api/jobs/${jobToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove job from local state
        setJobs(prev => prev.filter(job => job._id !== jobToDelete));
        alert('Job deleted successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to delete job'));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('An error occurred while deleting the job');
    } finally {
      setShowDeleteConfirm(false);
      setJobToDelete(null);
    }
  };

  // Handle job form submission (create or update)
  const handleJobSubmit = async () => {
    if (!jobFormData.title || !jobFormData.location || !jobFormData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setCreatingJob(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Prepare the job data
      const jobData: any = {
        title: jobFormData.title,
        location: jobFormData.location,
        description: jobFormData.description,
        salaryRange: {
          minimum: jobFormData.salaryRange.minimum,
          maximum: jobFormData.salaryRange.maximum,
          currency: jobFormData.salaryRange.currency,
          type: jobFormData.salaryRange.type
        },
        jobType: jobFormData.jobType,
        category: jobFormData.category,
        questions: jobFormData.questions.filter(q => q.trim() !== '').map(q => ({ question: q })),
        pageId: pageId as string
      };

      // If there's an image, upload it first
      let imageUrl = null;
      if (jobImage) {
        const imageFormData = new FormData();
        imageFormData.append('postMedia', jobImage);

        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.media[0].url;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Add image URL to job data if available
      if (imageUrl) {
        jobData.image = imageUrl;
      } else if (editingJob && editingJob.image) {
        // Keep existing image if no new image uploaded
        jobData.image = editingJob.image;
      }

      let response;
      if (editingJob) {
        // Update existing job
        response = await fetch(`${API_URL}/api/jobs/${editingJob._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(jobData)
        });
      } else {
        // Create new job
        response = await fetch(`${API_URL}/api/jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(jobData)
        });
      }

      if (response.ok) {
        const data = await response.json();
        
        if (editingJob) {
          // Update job in local state
          setJobs(prev => prev.map(job => 
            job._id === editingJob._id ? { ...job, ...data.job } : job
          ));
          alert('Job updated successfully!');
        } else {
          // Add new job to local state
          setJobs(prev => [...prev, data.job]);
          alert('Job created successfully!');
        }
        
        // Reset form
        setJobFormData({
          title: '',
          location: '',
          description: '',
          salaryRange: {
            minimum: 0,
            maximum: 0,
            currency: 'USD',
            type: 'per year'
          },
          jobType: 'Full time',
          category: 'Other',
          questions: [] as string[]
        });
        setJobImage(null);
        setEditingJob(null);
        setShowJobModal(false);
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to save job'));
      }
    } catch (error) {
      console.error('Error saving job:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('An error occurred while saving the job');
      }
    } finally {
      setCreatingJob(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!offerFormData.discountedItems.trim() || !offerFormData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (offerFormData.discountPercent <= 0 || offerFormData.discountPercent > 100) {
      alert('Discount percentage must be between 1 and 100');
      return;
    }

    setCreatingOffer(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Prepare the offer data
      const offerData: any = {
        offerType: offerFormData.offerType,
        discountPercent: offerFormData.discountPercent,
        discountedItems: offerFormData.discountedItems,
        currency: offerFormData.currency,
        description: offerFormData.description,
        endDate: offerFormData.endDate,
        endTime: offerFormData.endTime,
        pageId: pageId as string
      };

      // If there's a thumbnail, upload it first
      let thumbnailUrl = null;
      if (offerThumbnail) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('postMedia', offerThumbnail);

  const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: thumbnailFormData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          thumbnailUrl = uploadData.media[0].url;
        } else {
          throw new Error('Failed to upload thumbnail');
        }
      }

      // Add thumbnail URL to offer data if available
      if (thumbnailUrl) {
        offerData.thumbnail = thumbnailUrl;
      }

      // Create the offer (you'll need to implement this API endpoint)
  const response = await fetch(`${API_URL}/api/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(offerData)
      });

      if (response.ok) {
        const offer = await response.json();
        console.log('Offer created successfully:', offer);
        
        // Reset form
        setOfferFormData({
          offerType: 'Discount Percent',
          discountPercent: 1,
          discountedItems: '',
          currency: 'USD',
          description: '',
          endDate: '',
          endTime: ''
        });
        setOfferThumbnail(null);
        setShowOfferModal(false);
        
        alert('Offer created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Offer creation failed:', errorData);
        alert('Error: ' + (errorData.message || errorData.error || 'Failed to create offer'));
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('An error occurred while creating the offer');
      }
    } finally {
      setCreatingOffer(false);
    }
  };

  const handleOfferThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOfferThumbnail(file);
    }
  };

 
  const addQuestion = () => {
    setJobFormData(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }));
  };

  const updateQuestion = (index: number, value: string) => {
    setJobFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? value : q)
    }));
  };

  const removeQuestion = (index: number) => {
    setJobFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleJobImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJobImage(file);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hrs`;
    if (diffInHours < 48) return '1 day';
    return `${Math.floor(diffInHours / 24)} days`;
  };

  const handleProfileImageUpload = async () => {
    if (!profileImage) return;

    setUploadingProfile(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // First upload the image to get the URL
      const formData = new FormData();
      formData.append('postMedia', profileImage);

  const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.media[0].url;

     
  const updateResponse = await fetch(`${API_URL}/api/pages/${pageId}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profileImage: imageUrl
        })
      });

      if (updateResponse.ok) {
        const updatedPage = await updateResponse.json();
        setPage(updatedPage.page);
        setProfileImage(null);
        alert('Profile image updated successfully!');
      } else {
        throw new Error('Failed to update page');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('Error updating profile image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverImageUpload = async () => {
    if (!coverImage) return;

    setUploadingCover(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // First upload the image to get the URL
      const formData = new FormData();
      formData.append('postMedia', coverImage);

  const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.media[0].url;

      // Now update the page with the new cover image
  const updateResponse = await fetch(`${API_URL}/api/pages/${pageId}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverImage: imageUrl
        })
      });

      if (updateResponse.ok) {
        const updatedPage = await updateResponse.json();
        setPage(updatedPage.page);
        setCoverImage(null);
        alert('Cover image updated successfully!');
      } else {
        throw new Error('Failed to update page');
      }
    } catch (error) {
      console.error('Error updating cover image:', error);
      alert('Error updating cover image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Page Not Found</h1>
          <p className={`mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>The page you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header with Back Button */}
      <div className={`border-b px-4 py-3 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-pink-600 via-purple-600 to-blue-600">
        {page.coverImage && (
          <img
            src={page.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-4 right-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="hidden"
            id="cover-image-upload"
          />
          <label
            htmlFor="cover-image-upload"
            className="bg-gray-800 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Cover
          </label>
        </div>
        {coverImage && (
          <div className="absolute top-4 right-4">
            <button
              onClick={handleCoverImageUpload}
              disabled={uploadingCover}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {uploadingCover ? 'Uploading...' : 'Save Cover'}
            </button>
          </div>
        )}
      </div>

      {/* Page Info Section */}
      <div className="relative px-4 pb-4 -mt-20">
        <div className="flex items-start justify-between">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 bg-orange-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
              {page.profileImage ? (
                <img
                  src={page.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🚩</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
              id="profile-image-upload"
            />
            <label
              htmlFor="profile-image-upload"
              className="absolute bottom-2 right-2 bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </label>
          </div>
          {profileImage && (
            <div className="absolute top-2 right-2">
              <button
                onClick={handleProfileImageUpload}
                disabled={uploadingProfile}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {uploadingProfile ? 'Uploading...' : 'Save Profile'}
              </button>
            </div>
          )}

          {/* Page Details */}
          <div className="flex-1 ml-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className={`text-3xl font-bold mb-1 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{page.name}</h1>
                <p className={`text-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>@{page.url}</p>
                
                {/* Reviews Summary */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
              </div>
                    <span className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              <button className={`px-4 py-2 rounded-lg transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`mt-6 border-b transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : isDarkMode 
                      ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

            {/* Main Content */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'Home' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Post Creation and Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Post Creation */}
                <div className={`rounded-lg border p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {page.profileImage ? (
                        <img
                          src={page.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">🚩</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <button
                        onClick={() => setShowPostModal(true)}
                        className={`w-full text-left p-3 border rounded-lg transition-colors min-h-[80px] flex items-start ${isDarkMode ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300' : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700'}`}
                      >
                        What's going on? #Hashtag.. @Mention.. Link..
                      </button>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setShowPostModal(true)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Add Video"
                          >
                            <Video className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setShowPostModal(true)}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                            title="Add Image"
                          >
                            <Image className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setShowPostModal(true)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            title="Add Emoji"
                          >
                            <Smile className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setShowPostModal(true)}
                            className="p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-colors"
                            title="Add Location"
                          >
                            <MapPin className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setShowPostModal(true)}
                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                            title="Add Tags"
                          >
                            <Hash className="w-5 h-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => setShowPostModal(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Filters */}
                <div className={`flex space-x-1 rounded-lg border p-1 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  {postFilters.map((filter) => (
                    <button
                      key={filter.id}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        filter.id === 'all'
                          ? 'bg-blue-100 text-blue-700'
                          : isDarkMode 
                            ? 'text-gray-400 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Posts Feed */}
                <div className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <FeedPost
                        key={post._id}
                        post={{
                          _id: post._id,
                          content: post.content,
                          media: post.media || [],
                          createdAt: post.createdAt,
                          user: {
                            _id: page.createdBy,
                            name: page.creatorName,
                            username: page.url,
                            avatar: page.creatorAvatar
                          },
                          likes: post.likes || [],
                          comments: post.comments || [],
                          shares: post.shares || []
                        }}
                        onLike={(postId) => console.log('Like post:', postId)}
                        onComment={(postId, comment) => console.log('Comment on post:', postId, comment)}
                        onShare={(postId, shareOptions) => console.log('Share post:', postId, shareOptions)}
                        onSave={(postId) => console.log('Save post:', postId)}
                        onDelete={(postId) => console.log('Delete post:', postId)}
                        onEdit={(post) => console.log('Edit post:', post)}
                        isOwnPost={false}
                      />
                    ))
                  ) : (
                    <div className={`rounded-lg border p-8 text-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <FileText className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No posts yet</h3>
                      <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Be the first to share something on this page!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-4">
                {/* Search */}
                <div className={`rounded-lg border p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Search for posts"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                </div>

                {/* Boost Page */}
                <div className={`rounded-lg border p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-medium mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Boost Page</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className={`w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>0 people like this</span>
                  </div>
                  <div className="text-sm text-green-600 font-medium">+0 This week</div>
                </div>

                {/* Page Stats */}
                <div className={`rounded-lg border p-4 space-y-3 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{posts.length} posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Diamond className={`w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{page.category}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Jobs' && (
            <div className="space-y-6">
              {/* Jobs Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Jobs</h3>
                  <p className={`mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
                </div>
                <button
                  onClick={() => setShowJobModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Job
                </button>
              </div>

              {/* Jobs List */}
              <div className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div 
                      key={job._id} 
                      className={`rounded-lg border p-6 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleJobClick(job)}
                    >
                      <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {page.profileImage ? (
                      <img
                        src={page.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">🚩</span>
                    )}
                  </div>
                          <div className="flex-1">
                            <h4 className={`text-xl font-bold mb-1 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job.title}</h4>
                            
                            {/* Job Image */}
                            {job.image && (
                              <div className="mb-3">
                                <img
                                  src={job.image}
                                  alt={job.title}
                                  className="w-full h-32 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            <div className={`flex items-center gap-2 mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <span>{page.name}</span>
                              <span>•</span>
                              <span>{getTimeAgo(job.createdAt)}</span>
                              <span>•</span>
                              <span>{job.category}</span>
                            </div>
                            <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{job.description.substring(0, 150)}...</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
                          >
                          View Interested Candidates ({job.interestedCandidates.length})
                        </button>
                          
                          {/* Edit and Delete buttons - only show for page owner */}
                          {(() => {
                            try {
                              const currentUser = JSON.parse(localStorage.getItem('user') || '{}') as any;
                              return page.createdBy === currentUser._id;
                            } catch {
                              return false;
                            }
                          })() && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditJob(job);
                                }}
                                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-1"
                                title="Edit Job"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteJob(job._id);
                                }}
                                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center gap-1"
                                title="Delete Job"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Salary and Job Type */}
                      <div className={`grid grid-cols-3 gap-4 p-4 rounded-lg transition-colors duration-200 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div>
                          <div className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>MINIMUM</div>
                          <div className={`text-lg font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {job.salaryRange.currency === 'USD' ? '$' : 
                             job.salaryRange.currency === 'EUR' ? '€' : 
                             job.salaryRange.currency === 'GBP' ? '£' : 
                             job.salaryRange.currency === 'INR' ? '₹' : 
                             job.salaryRange.currency === 'PKR' ? '₨' : ''}
                            {job.salaryRange.minimum} {job.salaryRange.type}
                          </div>
                        </div>
                        <div>
                          <div className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>MAXIMUM</div>
                          <div className={`text-lg font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {job.salaryRange.currency === 'USD' ? '$' : 
                             job.salaryRange.currency === 'EUR' ? '€' : 
                             job.salaryRange.currency === 'GBP' ? '£' : 
                             job.salaryRange.currency === 'INR' ? '₹' : 
                             job.salaryRange.currency === 'PKR' ? '₨' : ''}
                            {job.salaryRange.maximum} {job.salaryRange.type}
                          </div>
                        </div>
                        <div>
                          <div className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>TYPE</div>
                          <div className={`text-lg font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job.jobType}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`rounded-lg border p-8 text-center transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <FileText className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No jobs posted yet</h3>
                    <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Create your first job posting to attract candidates!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Offers' && (
            <div className="space-y-6">
              {/* Offers Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Offers</h3>
                  <p className={`mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Create and manage special offers for your customers</p>
                </div>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Offer
                </button>
              </div>

              {/* Offers List - Placeholder for now */}
              <div className={`rounded-lg border p-8 text-center transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Diamond className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No offers yet</h3>
                <p className={`mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Create your first offer to attract customers!</p>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Your First Offer
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="space-y-6">
              {/* Reviews Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reviews</h3>
                  <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''} • 
                    {reviews.length > 0 ? (
                      <span className="ml-1">
                        {Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length * 10) / 10} out of 5 stars
                      </span>
                    ) : (
                      <span className="ml-1">No reviews yet</span>
                    )}
                  </p>
                </div>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Write Review
                </button>
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className={`rounded-lg border p-6 transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <span className={`font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {review.user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <h4 className={`font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {review.user?.name || 'Anonymous User'}
                            </h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400' : isDarkMode ? 'text-gray-600' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className={`text-sm ml-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {getTimeAgo(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
            <div className={`rounded-lg border p-8 text-center transition-colors duration-200 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                  <svg className={`w-12 h-12 mx-auto mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No reviews yet</h3>
                  <p className={`mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Be the first to write a review for this page!</p>
                  <button 
                    onClick={() => setShowReviewModal(true)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Write First Review
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Invite' && (
            <div className="space-y-6">
              {/* Invite Header */}
              <div className="text-center">
                <h3 className={`text-2xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Invite People</h3>
                <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Share this page with your friends and colleagues</p>
              </div>

              {/* Invite Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Invite */}
                <div className={`rounded-lg border p-6 transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                    }`}>
                      <svg className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Invite</h4>
                  </div>
                  <p className={`mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Send a personalized invitation via email</p>
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Send Email Invite
                  </button>
                </div>

                {/* Share Link */}
                <div className={`rounded-lg border p-6 transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                    }`}>
                      <svg className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </div>
                    <h4 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Share Link</h4>
                  </div>
                  <p className={`mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Copy and share the page link directly</p>
                  <button 
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        alert('Page link copied to clipboard!');
                      } catch (error) {
                        alert('Failed to copy link. Please copy manually: ' + window.location.href);
                      }
                    }}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Page Info */}
              <div className={`rounded-lg p-6 transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>About this page</h4>
                <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Share this page to help others discover {page?.name || 'this amazing page'}. 
                  You can invite people via email or share the direct link on social media, 
                  messaging apps, or anywhere else you'd like.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
          <div className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[calc(100vh-140px)] overflow-y-auto transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create New Post</h2>
                <button
                  onClick={() => setShowPostModal(false)}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                </button>
              </div>

                              {/* Post Form */}
                <div className="space-y-4">
                  {/* Title Field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Post title (optional)"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  {/* Content Field */}
                  <div>
                    <textarea
                      placeholder="What's going on? #Hashtag.. @Mention.. Link.."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Privacy</label>
                    <select
                      value={postPrivacy}
                      onChange={(e) => setPostPrivacy(e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="space-y-2">
                      <p className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors duration-200 ${
                              isDarkMode 
                                ? 'bg-blue-900/30 text-blue-400' 
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            #{tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className={`transition-colors duration-200 ${
                                isDarkMode ? 'hover:text-blue-300' : 'hover:text-blue-900'
                              }`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Location */}
                  {selectedLocation && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <MapPin className={`w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedLocation}</span>
                      <button
                        onClick={() => setSelectedLocation('')}
                        className={`ml-auto transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                {/* Media Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Add Media</label>
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`text-sm mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click to upload or drag and drop</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                    >
                      Choose Files
                    </label>
                  </div>
                  
                  {/* Selected Files */}
                  {mediaFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className={`flex items-center justify-between p-2 rounded transition-colors duration-200 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <span className={`text-sm truncate transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{file.name}</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className={`flex items-center justify-between pt-4 border-t transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <button className={`p-2 text-red-500 rounded-full transition-colors duration-200 ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}>
                      <Video className="w-5 h-5" />
                    </button>
                    <button className={`p-2 text-green-500 rounded-full transition-colors duration-200 ${isDarkMode ? 'hover:bg-green-900/20' : 'hover:bg-green-50'}`}>
                      <Image className="w-5 h-5" />
                    </button>
                    <button className={`p-2 text-blue-500 rounded-full transition-colors duration-200 ${isDarkMode ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'}`}>
                      <Smile className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setShowLocationPicker(!showLocationPicker)}
                      className={`p-2 text-purple-500 rounded-full transition-colors duration-200 ${isDarkMode ? 'hover:bg-purple-900/20' : 'hover:bg-purple-50'}`}
                      title="Add Location"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setShowTagInput(!showTagInput)}
                      className={`p-2 text-orange-500 rounded-full transition-colors duration-200 ${isDarkMode ? 'hover:bg-orange-900/20' : 'hover:bg-orange-50'}`}
                      title="Add Tags"
                    >
                      <Hash className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowPostModal(false)}
                      className={`px-4 py-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePostWithModal}
                      disabled={posting || (!postContent.trim() && mediaFiles.length === 0)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {posting ? 'Creating...' : 'Create Post'}
                    </button>
                  </div>
                </div>

                {/* Location Picker */}
                {showLocationPicker && (
                  <div className={`mt-4 p-3 border rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <input
                      type="text"
                      placeholder="Enter location..."
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                )}

                {/* Tag Input */}
                {showTagInput && (
                  <div className={`mt-4 p-3 border rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <input
                      type="text"
                      placeholder="Type tag and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInput}
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Job Creation Modal - Like Image Design */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto scrollbar-hide transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{editingJob ? 'Edit Job' : 'Create Job'}</h2>
                <button
                  onClick={() => {
                    setShowJobModal(false);
                    setEditingJob(null);
                    setJobImage(null);
                    setJobFormData({
                      title: '',
                      location: '',
                      description: '',
                      salaryRange: {
                        minimum: 0,
                        maximum: 0,
                        currency: 'USD',
                        type: 'per year'
                      },
                      jobType: 'Full time',
                      category: 'Other',
                      questions: [] as string[]
                    });
                  }}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Job Form - Matching Image Design */}
              <div className="space-y-6">
                {/* Job Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Job Title</label>
                  <input
                    type="text"
                    placeholder="Job title"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                  <input
                    type="text"
                    placeholder="Location"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, location: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                  <textarea
                    placeholder="Description"
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <p className={`text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Describe the responsibilities and preferred skills for this job</p>
                </div>

                {/* Salary Range Section */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Salary Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Minimum</label>
                      <div className="relative">
                        <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>₹</span>
                        <input
                          type="number"
                          placeholder="Minimum"
                          value={jobFormData.salaryRange.minimum || ''}
                          onChange={(e) => setJobFormData(prev => ({
                            ...prev,
                            salaryRange: { ...prev.salaryRange, minimum: Number(e.target.value) || 0 }
                          }))}
                          className={`w-full pl-8 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Maximum</label>
                      <div className="relative">
                        <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>₹</span>
                        <input
                          type="number"
                          placeholder="Maximum"
                          value={jobFormData.salaryRange.maximum || ''}
                          onChange={(e) => setJobFormData(prev => ({
                            ...prev,
                            salaryRange: { ...prev.salaryRange, maximum: Number(e.target.value) || 0 }
                          }))}
                          className={`w-full pl-8 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Currency</label>
                      <select
                        value={jobFormData.salaryRange.currency}
                        onChange={(e) => setJobFormData(prev => ({
                          ...prev,
                          salaryRange: { ...prev.salaryRange, currency: e.target.value }
                        }))}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="PKR">PKR (₨)</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
                      <select
                        value={jobFormData.salaryRange.type}
                        onChange={(e) => setJobFormData(prev => ({
                          ...prev,
                          salaryRange: { ...prev.salaryRange, type: e.target.value }
                        }))}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="Per Hour">Per Hour</option>
                        <option value="Per Day">Per Day</option>
                        <option value="Per Week">Per Week</option>
                        <option value="Per Month">Per Month</option>
                        <option value="Per Year">Per Year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Job Type and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Job Type</label>
                    <select
                      value={jobFormData.jobType}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, jobType: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="Full time">Full time</option>
                      <option value="Part time">Part time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                    <select
                      value={jobFormData.category}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Design">Design</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Administration">Administration</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Questions Section */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Questions</h3>
                  <button
                    onClick={addQuestion}
                    className={`flex items-center gap-2 mb-3 transition-colors duration-200 ${
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                  {jobFormData.questions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Enter question"
                        value={question}
                        onChange={(e) => updateQuestion(index, e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      <button
                        onClick={() => removeQuestion(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Image Upload Section */}
                <div>
                  <p className={`text-sm mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Add an image to help applicants see what it's like to work at this location.</p>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    {jobImage ? (
                      <div className="space-y-4">
                        <img
                          src={URL.createObjectURL(jobImage)}
                          alt="Job preview"
                          className="w-full h-32 object-cover rounded-lg mx-auto"
                        />
                        <button
                          onClick={() => setJobImage(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click to upload or drag and drop</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleJobImageChange}
                          className="hidden"
                          id="job-image-upload"
                        />
                        <label
                          htmlFor="job-image-upload"
                          className={`px-4 py-2 rounded-lg cursor-pointer inline-block mr-2 transition-colors duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Browse To Upload
                        </label>
                        <button className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}>
                          Use Cover Photo
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex items-center justify-between pt-6 border-t transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => {
                      setShowJobModal(false);
                      setEditingJob(null);
                      setJobImage(null);
                      setJobFormData({
                        title: '',
                        location: '',
                        description: '',
                        salaryRange: {
                          minimum: 0,
                          maximum: 0,
                          currency: 'USD',
                          type: 'per year'
                        },
                        jobType: 'Full time',
                        category: 'Other',
                        questions: [] as string[]
                      });
                    }}
                    className={`px-6 py-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJobSubmit}
                    disabled={creatingJob || !jobFormData.title || !jobFormData.location || !jobFormData.description}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {creatingJob ? (editingJob ? 'Updating...' : 'Creating...') : (editingJob ? 'Update Job' : 'Publish')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto scrollbar-hide transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create New Offer</h2>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Offer Form */}
              <div className="space-y-6">
                {/* Offer Type */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Offer Type</label>
                  <input
                    type="text"
                    value={offerFormData.offerType}
                    readOnly
                    className={`w-full px-3 py-2.5 border rounded-lg transition-colors duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-gray-400' 
                        : 'border-gray-300 bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>

                {/* Discount Percent */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Discount Percent</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={offerFormData.discountPercent}
                    onChange={(e) => setOfferFormData(prev => ({ ...prev, discountPercent: Number(e.target.value) }))}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Discounted Items and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Discounted Items and/or Services</label>
                    <textarea
                      placeholder="Add items or services to this offer"
                      value={offerFormData.discountedItems}
                      onChange={(e) => setOfferFormData(prev => ({ ...prev, discountedItems: e.target.value }))}
                      rows={3}
                      maxLength={100}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <p className={`text-xs mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max 100 characters</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Currency</label>
                    <input
                      type="text"
                      value={`${offerFormData.currency} (${offerFormData.currency === 'USD' ? '$' : offerFormData.currency === 'EUR' ? '€' : offerFormData.currency === 'GBP' ? '£' : offerFormData.currency === 'INR' ? '₹' : offerFormData.currency === 'PKR' ? '₨' : ''})`}
                      readOnly
                      className={`w-full px-3 py-2.5 border rounded-lg transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-gray-400' 
                          : 'border-gray-300 bg-gray-50 text-gray-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                  <textarea
                    placeholder="Describe your offer in detail"
                    value={offerFormData.description}
                    onChange={(e) => setOfferFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* End Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End date</label>
                    <input
                      type="date"
                      value={offerFormData.endDate}
                      onChange={(e) => setOfferFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End time</label>
                    <input
                      type="time"
                      value={offerFormData.endTime}
                      onChange={(e) => setOfferFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Thumbnail</label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    {offerThumbnail ? (
                      <div className="space-y-4">
                        <img
                          src={URL.createObjectURL(offerThumbnail)}
                          alt="Offer thumbnail preview"
                          className="w-full h-32 object-cover rounded-lg mx-auto"
                        />
                        <button
                          onClick={() => setOfferThumbnail(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click to upload or drag and drop</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleOfferThumbnailChange}
                          className="hidden"
                          id="offer-thumbnail-upload"
                        />
                        <label
                          htmlFor="offer-thumbnail-upload"
                          className={`px-4 py-2 rounded-lg cursor-pointer inline-block transition-colors duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Browse To Upload
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex items-center justify-between pt-6 border-t transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setShowOfferModal(false)}
                    className={`px-6 py-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateOffer}
                    disabled={creatingOffer || !offerFormData.discountedItems.trim() || !offerFormData.description.trim()}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {creatingOffer ? 'Creating...' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-colors duration-200 ${
                isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <svg className={`w-6 h-6 transition-colors duration-200 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Job</h3>
                <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This action cannot be undone</p>
              </div>
            </div>
            
            <p className={`mb-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to delete this job posting? This will permanently remove the job and all associated data.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setJobToDelete(null);
                }}
                className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteJob}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {showJobDetail && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl w-full max-w-2xl h-[80vh] max-h-[600px] overflow-y-auto flex flex-col transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6 flex-1 flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className={`text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedJob.title}</h2>
                <button
                  onClick={() => {
                    setShowJobDetail(false);
                    setSelectedJob(null);
                  }}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-6 h-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Job Content */}
              <div className="space-y-6 flex-1 overflow-y-auto">
                {/* Job Header Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {page.profileImage ? (
                      <img
                        src={page.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🚩</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`flex items-center gap-2 mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-medium">{page.name}</span>
                      <span>•</span>
                      <span>{getTimeAgo(selectedJob.createdAt)}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full text-sm transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-blue-900/30 text-blue-400' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedJob.category}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <MapPin className="w-4 h-4" />
                      <span>{selectedJob.location}</span>
                    </div>
                  </div>
                </div>

                {/* Job Image */}
                {selectedJob.image && (
                  <div>
                    <img
                      src={selectedJob.image}
                      alt={selectedJob.title}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Job Description */}
                <div>
                  <h3 className={`text-lg font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Job Description</h3>
                  <div className="prose max-w-none">
                    <p className={`whitespace-pre-wrap transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedJob.description}</p>
                  </div>
                </div>

                {/* Salary and Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className={`text-sm font-medium mb-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>MINIMUM SALARY</div>
                    <div className={`text-xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.salaryRange.currency === 'USD' ? '$' : 
                       selectedJob.salaryRange.currency === 'EUR' ? '€' : 
                       selectedJob.salaryRange.currency === 'GBP' ? '£' : 
                       selectedJob.salaryRange.currency === 'INR' ? '₹' : 
                       selectedJob.salaryRange.currency === 'PKR' ? '₨' : ''}
                      {selectedJob.salaryRange.minimum.toLocaleString()} {selectedJob.salaryRange.type}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className={`text-sm font-medium mb-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>MAXIMUM SALARY</div>
                    <div className={`text-xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.salaryRange.currency === 'USD' ? '$' : 
                       selectedJob.salaryRange.currency === 'EUR' ? '€' : 
                       selectedJob.salaryRange.currency === 'GBP' ? '£' : 
                       selectedJob.salaryRange.currency === 'INR' ? '₹' : 
                       selectedJob.salaryRange.currency === 'PKR' ? '₨' : ''}
                      {selectedJob.salaryRange.maximum.toLocaleString()} {selectedJob.salaryRange.type}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className={`text-sm font-medium mb-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>JOB TYPE</div>
                    <div className={`text-xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedJob.jobType}</div>
                  </div>
                </div>

                {/* Application Questions */}
                {selectedJob.questions && selectedJob.questions.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Application Questions</h3>
                    <div className="space-y-3">
                      {selectedJob.questions.map((question, index) => (
                        <div key={index} className={`p-4 rounded-lg transition-colors duration-200 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-start gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-colors duration-200 ${
                              isDarkMode 
                                ? 'bg-blue-900/30 text-blue-400' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {index + 1}
                            </span>
                            <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{question.question}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className={`flex items-center justify-between pt-6 border-t flex-shrink-0 transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleApplyClick}
                      className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 flex items-center gap-2 transition-colors duration-200"
                    >
                      <Heart className="w-5 h-5" />
                      Apply Now
                    </button>
                    <button 
                      onClick={handleShareClick}
                      className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>
                  
                  {/* Owner Actions */}
                  {(() => {
                    try {
                      const currentUser = JSON.parse(localStorage.getItem('user') || '{}') as any;
                      return page.createdBy === currentUser._id;
                    } catch {
                      return false;
                    }
                  })() && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowJobDetail(false);
                          setSelectedJob(null);
                          handleEditJob(selectedJob);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowJobDetail(false);
                          setSelectedJob(null);
                          handleDeleteJob(selectedJob._id);
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl w-full max-w-xl h-[80vh] max-h-[600px] overflow-y-auto flex flex-col transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6 flex-1 flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                  <h2 className={`text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Apply for {selectedJob.title}</h2>
                  <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>at {page.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setApplyFormData({
                      name: '',
                      email: '',
                      phone: '',
                      coverLetter: '',
                      resume: null,
                      answers: []
                    });
                  }}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-6 h-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Apply Form */}
              <div className="space-y-6 flex-1 overflow-y-auto">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={applyFormData.name}
                        onChange={(e) => setApplyFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={applyFormData.email}
                        onChange={(e) => setApplyFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={applyFormData.phone}
                        onChange={(e) => setApplyFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resume (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {applyFormData.resume ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{applyFormData.resume.name}</p>
                        <button
                          onClick={() => setApplyFormData(prev => ({ ...prev, resume: null }))}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove Resume
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Click to upload resume</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setApplyFormData(prev => ({ ...prev, resume: file }));
                            }
                          }}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label
                          htmlFor="resume-upload"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block text-sm"
                        >
                          Choose File
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter (Optional)</label>
                  <textarea
                    value={applyFormData.coverLetter}
                    onChange={(e) => setApplyFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>

                {/* Application Questions */}
                {selectedJob.questions && selectedJob.questions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Questions</h3>
                    <div className="space-y-4">
                      {selectedJob.questions.map((question, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {index + 1}. {question.question}
                          </label>
                          <textarea
                            value={applyFormData.answers[index] || ''}
                            onChange={(e) => {
                              const newAnswers = [...applyFormData.answers];
                              newAnswers[index] = e.target.value;
                              setApplyFormData(prev => ({ ...prev, answers: newAnswers }));
                            }}
                            rows={3}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Your answer..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className={`flex items-center justify-end gap-3 pt-6 border-t flex-shrink-0 transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setApplyFormData({
                        name: '',
                        email: '',
                        phone: '',
                        coverLetter: '',
                        resume: null,
                        answers: []
                      });
                    }}
                    className={`px-6 py-2 border rounded-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplySubmit}
                    disabled={applying || !applyFormData.name.trim() || !applyFormData.email.trim() || !applyFormData.phone.trim()}
                    className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
                  >
                    {applying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[80vh] max-h-[500px] overflow-y-auto flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewFormData({ rating: 5, comment: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Review Form */}
              <div className="space-y-6 flex-1 overflow-y-auto">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setReviewFormData(prev => ({ ...prev, rating }))}
                        className="p-1"
                      >
                        <svg
                          className={`w-8 h-8 ${
                            rating <= reviewFormData.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {reviewFormData.rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    placeholder="Share your experience with this page..."
                  />
                </div>

                {/* Action Buttons */}
                <div className={`flex items-center justify-end gap-3 pt-6 border-t flex-shrink-0 transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewFormData({ rating: 5, comment: '' });
                    }}
                    className={`px-6 py-2 border rounded-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReviewSubmit}
                    disabled={submittingReview || !reviewFormData.comment.trim()}
                    className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
                  >
                    {submittingReview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[80vh] max-h-[500px] overflow-y-auto flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900">Invite People</h2>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteData({ email: '', message: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Invite Form */}
              <div className="space-y-6 flex-1 overflow-y-auto">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personal Message (Optional)</label>
                  <textarea
                    value={inviteData.message}
                    onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Add a personal message..."
                  />
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Subject: Check out {page?.name || 'this page'}!</p>
                    <p className="mt-2">
                      {inviteData.message || `I thought you might be interested in checking out ${page?.name || 'this page'}.`}
                    </p>
                    <p className="mt-2 text-blue-600">{window.location.href}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex items-center justify-end gap-3 pt-6 border-t flex-shrink-0 transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteData({ email: '', message: '' });
                    }}
                    className={`px-6 py-2 border rounded-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteSubmit}
                    disabled={sendingInvite || !inviteData.email.trim()}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
                  >
                    {sendingInvite ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        Send Invite
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageView;

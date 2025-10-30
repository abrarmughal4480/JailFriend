"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Search, Upload, ArrowLeft, Menu, X } from 'lucide-react';
import Popup, { PopupState } from '../../../components/Popup';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getToken } from '../../../utils/auth';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';

interface FormData {
  eventName: string;
  eventDescription: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

interface Tab {
  name: string;
  href: string;
}

interface OtherEventsPageProps {
  pageTitle: string;
}

const EventManagement: React.FC = () => {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const router = useRouter();
  const [currentRoute, setCurrentRoute] = useState<string>('/events');
  const [routeHistory, setRouteHistory] = useState<string[]>(['/events']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    eventName: '',
    eventDescription: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    if (currentRoute === '/events') {
      // Check if user is authenticated using the auth utility
      if (!isAuthenticated()) {
        console.error('❌ User not authenticated');
        setEvents([]);
        handleAuthenticationError();
        return;
      }

      const token = getToken();
      console.log('🔐 Checking authentication for events...');
      console.log('🔐 Token exists:', !!token);
      console.log('🔐 Token value:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token || token === 'null' || token === 'undefined') {
        console.error('❌ No valid token found');
        setEvents([]);
        handleAuthenticationError();
        return;
      }

  const apiUrl = `${API_URL}/api/events`;
      console.log('🔐 Making request to:', apiUrl);
      console.log('🔐 Authorization header:', `Bearer ${token.substring(0, 20)}...`);

  fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          console.log('🔐 Response status:', res.status);
          console.log('🔐 Response headers:', Object.fromEntries(res.headers.entries()));
          
          if (!res.ok) {
            if (res.status === 401) {
              console.error('❌ Authentication failed - token may be invalid');
              handleAuthenticationError();
              return Promise.reject(new Error('Authentication failed'));
            }
            return res.json().then(errorData => {
              console.error('❌ API error:', errorData);
              throw new Error(errorData.message || `HTTP ${res.status}`);
            });
          }
          return res.json();
        })
        .then(data => {
          console.log('✅ Events data received:', data);
          // Ensure data is an array before setting it
          if (Array.isArray(data)) {
            setEvents(data);
          } else {
            console.error('❌ API returned non-array data:', data);
            setEvents([]);
          }
        })
        .catch((error) => {
          console.error('❌ Error fetching events:', error);
          setEvents([]);
          if (error.message !== 'Authentication failed') {
            showPopup('error', 'Error', 'Failed to load events. Please try again.');
          }
        });
    }
  }, [currentRoute]);

  const tabs: Tab[] = [
    { name: 'My events', href: '/events' },
    { name: 'Browse Events', href: '/events/browse' }, 
    { name: 'Events Going', href: '/events/going' },
    { name: 'Invited', href: '/events/invited' },
    { name: 'Events Interested', href: '/events/interested' },
    { name: 'Past Events', href: '/events/past' }
  ];

  // Navigation functions
  const navigateTo = (route: string): void => {
    setCurrentRoute(route);
    setRouteHistory(prev => [...prev, route]);
    setMobileMenuOpen(false);
  };

  const goBack = (): void => {
    if (routeHistory.length > 1) {
      const newHistory = [...routeHistory];
      newHistory.pop();
      const previousRoute = newHistory[newHistory.length - 1];
      setCurrentRoute(previousRoute);
      setRouteHistory(newHistory);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0] || null);
  };

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup({ isOpen: false, type: 'success', title: '', message: '' });
  };

  const handleAuthenticationError = () => {
    console.log('🔐 Handling authentication error - redirecting to login');
    showPopup('error', 'Session Expired', 'Your session has expired. Please log in again.');
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    // Reset form data
    setFormData({
      eventName: '',
      eventDescription: '',
      location: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: ''
    });
    setImage(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setFormData({
      eventName: event.title || '',
      eventDescription: event.description || '',
      location: event.location?.address || event.location?.name || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      startTime: event.startDate ? new Date(event.startDate).toTimeString().slice(0, 5) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      endTime: event.endDate ? new Date(event.endDate).toTimeString().slice(0, 5) : ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingEvent(null);
  };

  const handleSubmit = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        handleAuthenticationError();
        return;
      }

      const token = getToken();
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        handleAuthenticationError();
        return;
      }

      // Validate required fields
      if (!formData.eventName.trim()) {
        showPopup('error', 'Validation Error', 'Event name is required');
        return;
      }

      if (!formData.startDate || !formData.startTime) {
        showPopup('error', 'Validation Error', 'Start date and time are required');
        return;
      }

      if (!formData.endDate || !formData.endTime) {
        showPopup('error', 'Validation Error', 'End date and time are required');
        return;
      }

      // Validate dates
      const startDateTime = new Date(formData.startDate + 'T' + formData.startTime);
      const endDateTime = new Date(formData.endDate + 'T' + formData.endTime);
      const now = new Date();

      // Check if dates are valid
      if (isNaN(startDateTime.getTime())) {
        showPopup('error', 'Validation Error', 'Invalid start date or time format');
        return;
      }

      if (isNaN(endDateTime.getTime())) {
        showPopup('error', 'Validation Error', 'Invalid end date or time format');
        return;
      }

      if (startDateTime < now) {
        showPopup('error', 'Validation Error', 'Start date and time must be in the future');
        return;
      }

      if (endDateTime <= startDateTime) {
        showPopup('error', 'Validation Error', 'End date and time must be after start date and time');
        return;
      }

      console.log('=== Event Creation Debug ===');
      console.log('Token exists:', !!token);
      console.log('Token length:', token.length);
      console.log('Form data:', formData);
          console.log('API URL:', API_URL);

      const form = new FormData();
      form.append('title', formData.eventName.trim());
      form.append('description', formData.eventDescription || '');
      
      // Handle location properly
      if (formData.location && formData.location.trim()) {
        form.append('location[address]', formData.location.trim());
      }
      
      // Use the already validated dates
      form.append('startDate', startDateTime.toISOString());
      form.append('endDate', endDateTime.toISOString());
      form.append('category', 'social'); // Valid category from enum
      form.append('privacy', 'public');
      
      if (image) {
        form.append('coverImage', image);
        console.log('Image file attached:', image.name, image.size, image.type);
      }
      
      // Log the FormData contents for debugging
      console.log('FormData contents:');
      for (let [key, value] of form.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Additional debugging for location
      console.log('=== Location Debug ===');
      console.log('formData.location:', formData.location);
      console.log('formData.location type:', typeof formData.location);
      console.log('formData.location trimmed:', formData.location ? formData.location.trim() : 'null');
      
      // Additional debugging for date validation
      console.log('=== Date Validation Debug ===');
      console.log('Start date string:', formData.startDate + 'T' + formData.startTime);
      console.log('End date string:', formData.endDate + 'T' + formData.endTime);
      console.log('Start date ISO:', startDateTime.toISOString());
      console.log('End date ISO:', endDateTime.toISOString());
      console.log('Current time:', now.toISOString());
      console.log('Start date valid:', !isNaN(startDateTime.getTime()));
      console.log('End date valid:', !isNaN(endDateTime.getTime()));

  const apiUrl = `${API_URL}/api/events`;
      console.log('Making request to:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });

      console.log('Response status:', res.status);
      console.log('Response status text:', res.statusText);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (res.ok) {
        const eventData = await res.json();
        console.log('Event created successfully:', eventData);
        
        showPopup('success', 'Event Created!', 'Event created successfully!');
        
        // Reset form
        setFormData({
          eventName: '',
          eventDescription: '',
          location: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: ''
        });
        setImage(null);
        
        // Close modal
        closeCreateModal();
        
        // Refresh events list
  fetch(`${API_URL}/api/events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setEvents(data);
          } else {
            setEvents([]);
          }
        })
        .catch(() => setEvents([]));
      } else {
        console.error('Server response error:', res.status, res.statusText);
        let errorMessage = `Server error: ${res.status} ${res.statusText}`;
        
        try {
          const data = await res.json();
          console.error('Server error details:', data);
          console.error('Full error response:', JSON.stringify(data, null, 2));
          errorMessage = data.error || data.message || data.details || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          // Try to get the raw text
          try {
            const rawText = await res.text();
            console.error('Raw error response:', rawText);
            errorMessage = `Server error: ${res.status} ${res.statusText} - ${rawText}`;
          } catch (textError) {
            console.error('Failed to get raw response text:', textError);
          }
        }
        
        showPopup('error', 'Error', errorMessage);
      }
    } catch (err) {
      console.error('Network error:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      showPopup('error', 'Network Error', 'Network error occurred. Please check your connection and try again.');
    }
  };

  const handleDelete = async (id: string) => {
    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        handleAuthenticationError();
        return;
      }

      const token = getToken();
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        handleAuthenticationError();
        return;
      }

      console.log('Deleting event:', id);

  const response = await fetch(`${API_URL}/api/events/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        console.log('Event deleted successfully');
        showPopup('success', 'Event Deleted!', 'Event deleted successfully!');
        
        // Refresh events list
  fetch(`${API_URL}/api/events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setEvents(data);
          } else {
            setEvents([]);
          }
        })
        .catch(() => setEvents([]));
      } else if (response.status === 401) {
        showPopup('error', 'Authentication Error', 'Please log in again');
      } else if (response.status === 403) {
        showPopup('error', 'Permission Error', 'You are not authorized to delete this event');
      } else if (response.status === 404) {
        showPopup('error', 'Not Found', 'Event not found');
      } else {
        try {
          const error = await response.json();
          showPopup('error', 'Error', 'Error: ' + (error.message || error.error || 'Failed to delete event'));
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          showPopup('error', 'Error', `Server error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error('Network error:', err);
      showPopup('error', 'Network Error', 'Network error occurred. Please check your connection and try again.');
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
     
     // Parse the start and end dates to extract date and time
     const startDate = new Date(event.startDate);
     const endDate = new Date(event.endDate);
     
    setFormData({
       eventName: event.title,
       eventDescription: event.description,
       location: event.location?.address || event.location?.name || '',
       startDate: startDate.toISOString().split('T')[0],
       startTime: startDate.toTimeString().slice(0, 5),
       endDate: endDate.toISOString().split('T')[0],
       endTime: endDate.toTimeString().slice(0, 5)
    });
    setImage(null);
    navigateTo('/events/edit');
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        handleAuthenticationError();
        return;
      }

      const token = getToken();
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        handleAuthenticationError();
        return;
      }

      // Validate required fields
      if (!formData.eventName.trim()) {
        showPopup('error', 'Validation Error', 'Event name is required');
        return;
      }

      if (!formData.startDate || !formData.startTime) {
        showPopup('error', 'Validation Error', 'Start date and time are required');
        return;
      }

      if (!formData.endDate || !formData.endTime) {
        showPopup('error', 'Validation Error', 'End date and time are required');
        return;
      }

      // Validate dates
      const startDateTime = new Date(formData.startDate + 'T' + formData.startTime);
      const endDateTime = new Date(formData.endDate + 'T' + formData.endTime);

      // Check if dates are valid
      if (isNaN(startDateTime.getTime())) {
        showPopup('error', 'Validation Error', 'Invalid start date or time format');
        return;
      }

      if (isNaN(endDateTime.getTime())) {
        showPopup('error', 'Validation Error', 'Invalid end date or time format');
        return;
      }

      if (endDateTime <= startDateTime) {
        showPopup('error', 'Validation Error', 'End date and time must be after start date and time');
        return;
      }

      console.log('=== Event Update Debug ===');
      console.log('Token exists:', !!token);
      console.log('Token length:', token.length);
      console.log('Form data:', formData);
      console.log('Editing event ID:', editingEvent._id);

      const form = new FormData();
      form.append('title', formData.eventName.trim());
      form.append('description', formData.eventDescription || '');
      
      // Handle location properly
      if (formData.location && formData.location.trim()) {
        form.append('location[address]', formData.location.trim());
      }
      
      // Use the already validated dates
      form.append('startDate', startDateTime.toISOString());
      form.append('endDate', endDateTime.toISOString());
      form.append('category', 'social'); // Valid category from enum
      form.append('privacy', 'public');
      
      if (image) {
        form.append('coverImage', image);
        console.log('Image file attached:', image.name, image.size, image.type);
      }
      
      // Log the FormData contents for debugging
      console.log('FormData contents:');
      for (let [key, value] of form.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
  const apiUrl = `${API_URL}/api/events/${editingEvent._id}`;
      console.log('Making request to:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });
      
      console.log('Update response status:', res.status);
      console.log('Response status text:', res.statusText);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (res.ok) {
        const eventData = await res.json();
        console.log('Event updated successfully:', eventData);
        
        showPopup('success', 'Event Updated!', 'Event updated successfully!');
        
        // Close modal
        closeEditModal();
        
        // Refresh events list
  fetch(`${API_URL}/api/events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setEvents(data);
          } else {
            setEvents([]);
          }
        })
        .catch(() => setEvents([]));
      } else {
        console.error('Server response error:', res.status, res.statusText);
        let errorMessage = `Server error: ${res.status} ${res.statusText}`;
        
        try {
          const data = await res.json();
          console.error('Server error details:', data);
          errorMessage = data.error || data.message || data.details || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          // Try to get the raw text
          try {
            const rawText = await res.text();
            console.error('Raw error response:', rawText);
            errorMessage = `Server error: ${res.status} ${res.statusText} - ${rawText}`;
          } catch (textError) {
            console.error('Failed to get raw response text:', textError);
          }
        }
        
        showPopup('error', 'Error', errorMessage);
      }
    } catch (err) {
      console.error('Network error:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      showPopup('error', 'Network Error', 'Network error occurred. Please check your connection and try again.');
    }
  };

  // Get current active tab
  const getCurrentTab = (): string => {
    const activeTab = tabs.find(tab => tab.href === currentRoute);
    return activeTab ? activeTab.name : 'My events';
  };

  // Shared header component
  const Header: React.FC = () => (
    <div className="flex justify-between items-center mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Events</h1>
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
        <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
        <button 
          className="sm:hidden w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-4 h-4 text-gray-600" /> : <Menu className="w-4 h-4 text-gray-600" />}
        </button>
      </div>
    </div>
  );

  // Shared tabs component
  const TabsNavigation: React.FC = () => (
    <>
      {/* Desktop Tabs */}
      <div className="hidden sm:block border-b border-gray-200 mb-6 sm:mb-10">
        <div className="flex space-x-0 overflow-x-auto">
          {tabs.map((tab: Tab) => (
            <button 
              key={tab.name} 
              onClick={() => navigateTo(tab.href)}
              className={`px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                getCurrentTab() === tab.name
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-blue-600'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 sm:hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">Navigation</h3>
            </div>
            <div className="py-2">
              {tabs.map((tab: Tab) => (
                <button 
                  key={tab.name} 
                  onClick={() => navigateTo(tab.href)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    getCurrentTab() === tab.name
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );

  // Main events page
  const MainEventsPage: React.FC = () => (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white min-h-screen">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      <Header />
      <TabsNavigation />
      
      <div className="mb-6">
        {!Array.isArray(events) || events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-base sm:text-lg mb-4">No events to show</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map(event => (
              <div key={event._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {event.imageUrl && (
                  <img 
                    src={event.imageUrl} 
                    alt="Event" 
                    className="w-full h-40 sm:h-48 object-cover" 
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-3">{event.description}</p>
                  <p className="text-gray-500 text-sm mb-2">📍 {event.location?.address || event.location?.name || 'Location not specified'}</p>
                  <p className="text-xs text-gray-400 mb-3">
                    {new Date(event.startDate).toLocaleDateString()} {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(event.endDate).toLocaleDateString()} {new Date(event.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(event)} 
                      className="flex-1 px-3 py-2 bg-yellow-400 text-white rounded text-sm hover:bg-yellow-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(event._id)} 
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event CTA */}
      <div className="text-center py-12 sm:py-20">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Create Event
        </button>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b sticky top-0 bg-white">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Create New Event</h2>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Name *</label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="Enter event name"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              {/* Event Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your event"
                  rows={2}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Event location"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Start Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date & Time *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date & Time *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                    id="event-image-upload"
                  />
                  <label htmlFor="event-image-upload" className="cursor-pointer">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Click to upload image</p>
                    {image && (
                      <p className="text-xs text-green-600 mt-1">Selected: {image.name}</p>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 p-3 sm:p-4 border-t bg-gray-50 sticky bottom-0">
              <button
                onClick={closeCreateModal}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.eventName.trim() || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b sticky top-0 bg-white">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Edit Event</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Name *</label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="Enter event name"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              {/* Event Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your event"
                  rows={2}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Event location"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Start Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date & Time *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date & Time *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                    id="edit-event-image-upload"
                  />
                  <label htmlFor="edit-event-image-upload" className="cursor-pointer">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Click to upload image</p>
                    {image && (
                      <p className="text-xs text-green-600 mt-1">Selected: {image.name}</p>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 p-3 sm:p-4 border-t bg-gray-50 sticky bottom-0">
              <button
                onClick={closeEditModal}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!formData.eventName.trim() || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                Update Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Create event page
  const CreateEventPage: React.FC = () => (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white min-h-screen">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      <Header />
      <TabsNavigation />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="text-base sm:text-lg font-medium">Create new event</span>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Image Upload Section */}
            <div className="lg:col-span-1">
              <div className="text-sm text-gray-600 mb-3">Select an image</div>
              <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-4">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs sm:text-sm"
                />
                {image && (
                  <p className="text-xs text-green-600 mt-2">Image selected: {image.name}</p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="Event Name"
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <textarea
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleInputChange}
                  placeholder="Event Description"
                  rows={4}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <div className="text-sm text-blue-600 mb-3">When this event will start?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <div className="text-sm text-blue-600 mb-3">When this event will end?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 gap-4 sm:gap-0">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.eventName.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Event Page
  const EditEventPage: React.FC = () => (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white min-h-screen">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      <Header />
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
        <span className="text-base sm:text-lg font-medium">Edit event</span>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-1">
            <div className="text-sm text-gray-600 mb-3">Update image</div>
            <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-4">
              {editingEvent?.imageUrl && (
                <img src={editingEvent.imageUrl} alt="Event" className="w-20 h-20 sm:w-24 sm:h-24 object-cover mb-2 rounded" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="Event Name"
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <textarea
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleInputChange}
                placeholder="Event Description"
                rows={4}
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              />
            </div>
            <div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <div className="text-sm text-blue-600 mb-3">When this event will start?</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600 mb-3">When this event will end?</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 gap-4 sm:gap-0">
          <button
            type="button"
            onClick={() => { setEditingEvent(null); navigateTo('/events'); }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-6 sm:px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors w-full sm:w-auto"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );

  // Other pages component
  const OtherEventsPage: React.FC<OtherEventsPageProps> = ({ pageTitle }) => (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white min-h-screen">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      <Header />
      <TabsNavigation />
      
      <div className="text-center py-12 sm:py-20">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <p className="text-gray-500 text-base sm:text-lg mb-6 sm:mb-8">{pageTitle} - Coming Soon</p>
        <p className="text-gray-400 text-sm">This page is under development</p>
      </div>

      <button
        onClick={() => navigateTo('/events/create')}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );

  // Always render the main page with modals
  return <MainEventsPage />;
};

export default EventManagement;
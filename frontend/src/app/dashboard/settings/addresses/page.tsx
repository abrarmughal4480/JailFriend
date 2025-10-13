"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import Popup from '@/components/Popup';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Address {
  id: string;
  name: string;
  phone: string;
  country: string;
  city: string;
  zipCode: string;
  address: string;
}

interface AddressFormData {
  name: string;
  phone: string;
  country: string;
  city: string;
  zipCode: string;
  address: string;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const MyAddressesPage = () => {
  const { isDarkMode } = useDarkMode();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [formData, setFormData] = useState<AddressFormData>({
    name: 'Hina Sadaf -BSCS-2nd-029',
    phone: '',
    country: '',
    city: '',
    zipCode: '',
    address: ''
  });

  useEffect(() => {
    // Load addresses from backend API
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Fallback to localStorage if no token
          const savedAddresses = localStorage.getItem('userAddresses');
          if (savedAddresses) {
            setAddresses(JSON.parse(savedAddresses));
          }
          return;
        }

        const response = await fetch(`${API_URL}/api/addresses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAddresses(data);
          // Also save to localStorage as backup
          localStorage.setItem('userAddresses', JSON.stringify(data));
        } else {
          // Fallback to localStorage if API fails
          const savedAddresses = localStorage.getItem('userAddresses');
          if (savedAddresses) {
            setAddresses(JSON.parse(savedAddresses));
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        // Fallback to localStorage if network error
        const savedAddresses = localStorage.getItem('userAddresses');
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        }
      }
    };

    fetchAddresses();
  }, []);

  const showPopup = (type: 'success' | 'error' | 'info', title: string, message: string) => {
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

  const handleInputChange = (field: keyof AddressFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAddress = async () => {
    if (!formData.name.trim()) {
      showPopup('error', 'Validation Error', 'Please enter a name');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Try backend API first
        const response = await fetch(`${API_URL}/api/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const result = await response.json();
          const newAddress = result.address;
          
          const updatedAddresses = [...addresses, newAddress];
          setAddresses(updatedAddresses);
          localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
          
          showPopup('success', 'Success', 'Address added successfully!');
        } else {
          // Fallback to localStorage if API fails
          throw new Error('API failed, using localStorage');
        }
      } else {
        // Fallback to localStorage if no token
        throw new Error('No token, using localStorage');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      
      // Fallback to localStorage
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData
      };
      
      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
      
      showPopup('success', 'Success', 'Address added successfully! (Saved locally)');
    } finally {
      // Reset form
      setFormData({
        name: 'Hina Sadaf -BSCS-2nd-029',
        phone: '',
        country: '',
        city: '',
        zipCode: '',
        address: ''
      });
      
      setShowModal(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    // Reset form to default values
    setFormData({
      name: 'Hina Sadaf -BSCS-2nd-029',
      phone: '',
      country: '',
      city: '',
      zipCode: '',
      address: ''
    });
  };

  const handleDeleteAddress = async (addressId: string) => {
    showPopup('info', 'Confirm Delete', 'Are you sure you want to delete this address?');
    
    // For now, we'll proceed with deletion. In a real app, you'd want to show a confirmation dialog
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Try backend API first
        const response = await fetch(`${API_URL}/api/addresses/${addressId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
          setAddresses(updatedAddresses);
          localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
          showPopup('success', 'Success', 'Address deleted successfully!');
        } else {
          // Fallback to localStorage if API fails
          throw new Error('API failed, using localStorage');
        }
      } else {
        // Fallback to localStorage if no token
        throw new Error('No token, using localStorage');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      
      // Fallback to localStorage
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      setAddresses(updatedAddresses);
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
      showPopup('success', 'Success', 'Address deleted successfully! (Saved locally)');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`rounded-lg shadow-sm border p-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h1 className={`text-2xl font-semibold mb-8 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>My Addresses</h1>
        
        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Address Card */}
          <div 
            onClick={() => setShowModal(true)}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[200px] ${
              isDarkMode
                ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-600'
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className={`font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Add New</span>
          </div>

          {/* Existing Addresses */}
          {addresses.map((address) => (
            <div key={address.id} className={`border rounded-lg p-6 relative group hover:shadow-md transition-shadow ${
              isDarkMode 
                ? 'border-gray-700 hover:shadow-gray-900/20' 
                : 'border-gray-200'
            }`}>
              <button
                onClick={() => handleDeleteAddress(address.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600"
              >
                ×
              </button>
              
              <div className="space-y-2">
                <h3 className={`font-semibold text-sm ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{address.name}</h3>
                {address.phone && <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>📞 {address.phone}</p>}
                {address.address && <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>📍 {address.address}</p>}
                {address.city && <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>🏙️ {address.city}</p>}
                {address.country && <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>🌍 {address.country}</p>}
                {address.zipCode && <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>📮 {address.zipCode}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className={`rounded-lg shadow-2xl max-w-md w-full mx-4 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <h2 className={`text-xl font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Add New Address</h2>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Phone and Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* City and Zip Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Zip Code</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 ${
                    isDarkMode
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                      : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAddress}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default MyAddressesPage;

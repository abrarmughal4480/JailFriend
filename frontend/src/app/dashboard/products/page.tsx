"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Plus, Camera, Users, X, Upload, ArrowLeft, Menu, Search, Filter, Eye, Edit, Trash2, Star } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { getCurrentUserId } from '@/utils/auth';

interface Tab {
  name: string;
  active: boolean;
}

interface FormData {
  name: string;
  description: string;
  currency: string;
  price: string;
  type: string;
  location: string;
  category: string;
  totalItemUnits: string;
  photos: File[];
}

const MarketplaceSeller: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<string>('My Products');
  const [showSellModal, setShowSellModal] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    currency: 'USD ($)',
    price: '',
    type: 'New',
    location: '',
    category: 'Autos & Vehicles',
    totalItemUnits: '',
    photos: []
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

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

  useEffect(() => {
    if (activeTab === 'My Products') {
      setLoading(true);
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        console.error('No current user ID found');
        setError('Please login to view your products');
        setLoading(false);
        return;
      }

      fetch(`${API_URL}/api/products`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Products fetched:', data.length);
          console.log('Products data:', data);
          
          // Filter products to show only those created by the current user
          const myProducts = data.filter((product: any) => {
            // Check multiple possible fields for user ID
            const productUserId = product.userId || product.user?.id || product.user?._id || product.sellerId || product.createdBy;
            const normalizedProductUserId = productUserId ? String(productUserId).trim() : '';
            const normalizedCurrentUserId = String(currentUserId).trim();
            
            return normalizedProductUserId === normalizedCurrentUserId;
          });
          
          console.log('My products filtered:', myProducts.length);
          console.log('Current user ID:', currentUserId);
          
          // Log image information for each product
          myProducts.forEach((product: any, index: number) => {
            console.log(`Product ${index + 1}:`, {
              name: product.name,
              image: product.image,
              hasImage: !!product.image,
              imageType: typeof product.image,
              userId: product.userId || product.user?.id || product.user?._id || product.sellerId || product.createdBy
            });
          });
          
          setProducts(myProducts);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching products:', error);
          setError('Failed to load products');
          setLoading(false);
        });
    }
  }, [activeTab, showSellModal]);

  const tabs: Tab[] = [
    { name: 'My Products', active: true },
    { name: 'Purchased', active: false }
  ];

  const currencies: string[] = ['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)', 'AUD ($)'];
  const types: string[] = ['New', 'Used', 'Refurbished'];
  const [categories, setCategories] = useState<string[]>([
    'Autos & Vehicles',
    'Baby & Children\'s Products',
    'Beauty Products & Services',
    'Computers & Peripherals',
    'Consumer Electronics',
    'Other'
  ]);

  // Load product categories created in admin
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/categories/products`, {
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
            const current = prev.category;
            const nextCategory = names.includes(current) ? current : names[0];
            return { ...prev, category: nextCategory };
          });
        }
      } catch (error) {
        console.error('Error fetching product categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photos: [file] }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        alert('Please log in to create a product');
        return;
      }

      // Validate required fields
      if (!formData.name.trim()) {
        alert('Product name is required');
        return;
      }

      if (!formData.description.trim()) {
        alert('Product description is required');
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        alert('Valid price is required');
        return;
      }

      if (formData.description.length < 10) {
        alert('Description must be at least 10 characters long');
        return;
      }

      console.log('=== Product Creation Debug ===');
      console.log('Token exists:', !!token);
      console.log('Token length:', token.length);
      console.log('Form data:', formData);
          console.log('API URL:', API_URL);

      const form = new FormData();
      form.append('name', formData.name.trim());
      form.append('description', formData.description.trim());
      form.append('currency', formData.currency);
      form.append('price', formData.price);
      form.append('type', formData.type);
      form.append('location', formData.location.trim());
      form.append('category', formData.category);
      form.append('totalItemUnits', formData.totalItemUnits || '1');
      
      // Only append image if it exists
      if (formData.photos[0]) {
        form.append('image', formData.photos[0]);
        console.log('Image file attached:', formData.photos[0].name, formData.photos[0].size, formData.photos[0].type);
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
      
  const apiUrl = `${API_URL}/api/products`;
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
        const productData = await res.json();
        console.log('Product created successfully:', productData);
        
        alert('Product created successfully!');
        setShowSellModal(false);
        resetForm();
        
        // Refresh products list
        const currentUserId = getCurrentUserId();
        if (currentUserId) {
          fetch(`${API_URL}/api/products`)
            .then(res => res.json())
            .then(data => {
              // Filter products to show only those created by the current user
              const myProducts = data.filter((product: any) => {
                const productUserId = product.userId || product.user?.id || product.user?._id || product.sellerId || product.createdBy;
                const normalizedProductUserId = productUserId ? String(productUserId).trim() : '';
                const normalizedCurrentUserId = String(currentUserId).trim();
                return normalizedProductUserId === normalizedCurrentUserId;
              });
              setProducts(myProducts);
            })
            .catch(() => {
              setError('Failed to refresh products');
            });
        }
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
        
        alert('Error: ' + errorMessage);
      }
    } catch (err) {
      console.error('Network error:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      alert('Network error occurred. Please check your connection and try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      currency: 'USD ($)',
      price: '',
      type: 'New',
      location: '',
      category: 'Autos & Vehicles',
      totalItemUnits: '',
      photos: []
    });
    setImagePreview(null);
  };

  const handleCancel = (): void => {
    setShowSellModal(false);
    resetForm();
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

  const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('Product deleted successfully');
        // Remove the product from the local state
        setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
        
        // Show success popup
        setDeleteMessage('Product deleted successfully!');
        setShowDeletePopup(true);
        
        // Auto-hide popup after 3 seconds
        setTimeout(() => {
          setShowDeletePopup(false);
          setDeleteMessage('');
        }, 3000);
      } else {
        console.error('Failed to delete product:', response.status);
        // Show error popup
        setDeleteMessage('Failed to delete product. Please try again.');
        setShowDeletePopup(true);
        
        // Auto-hide popup after 3 seconds
        setTimeout(() => {
          setShowDeletePopup(false);
          setDeleteMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      // Show error popup
      setDeleteMessage('Error deleting product. Please try again.');
      setShowDeletePopup(true);
      
      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setShowDeletePopup(false);
        setDeleteMessage('');
      }, 3000);
    }
  };

  // Product Card Component
  const ProductCard: React.FC<{ product: any }> = ({ product }) => {
    // Helper function to get the correct image URL
    const getImageUrl = (imagePath: string): string | undefined => {
      if (!imagePath) return undefined;
      
      // If it's already a full URL (starts with http/https), return as is
      // This handles Cloudinary URLs and other external URLs
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      
      // If it's a relative path (local uploads), prefix with API URL
      // Always use HTTPS to avoid mixed content errors
  const apiUrl = API_URL;
      
      // Ensure we're using HTTPS
      const secureUrl = apiUrl.replace('http://', 'https://');
      
      // Ensure proper URL construction with forward slash
      const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      
      return `${secureUrl}${cleanPath}`;
    };

    const imageUrl = getImageUrl(product.image);
    
    // Debug logging
    console.log('Product image debug:', {
      productName: product.name,
      originalImage: product.image,
      processedImageUrl: imageUrl,
      hasImage: !!product.image,
      imageType: typeof product.image,
      imageLength: product.image ? product.image.length : 0
    });
    
    // Test if the image URL is accessible
    if (imageUrl) {
      fetch(imageUrl, { method: 'HEAD' })
        .then(response => {
          console.log(`✅ Image accessible: ${imageUrl} - Status: ${response.status}`);
        })
        .catch(error => {
          console.error(`❌ Image not accessible: ${imageUrl} - Error:`, error);
        });
    }
    
    return (
      <div className={`rounded-lg border overflow-hidden hover:shadow-md transition-all duration-200 ${viewMode === 'list' ? 'flex items-center p-4 gap-4' : 'flex flex-col'} ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name} 
            className={`object-cover ${viewMode === 'list' ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0' : 'w-full h-32 sm:h-40'}`}
            onError={(e) => {
              console.error('❌ Image failed to load:', {
                imageUrl,
                originalPath: product.image,
                productName: product.name,
                productId: product._id
              });
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className={`bg-gray-100 flex items-center justify-center ${viewMode === 'list' ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0' : 'w-full h-32 sm:h-40'}`}>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}
      
      <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : 'p-3 sm:p-4'} flex flex-col`}>
        <h3 className={`font-semibold text-sm sm:text-base truncate mb-1 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>
        <p className={`text-xs sm:text-sm mb-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{product.category}</p>
        <p className="text-blue-600 font-bold text-sm sm:text-base mb-1">{product.currency} {product.price}</p>
        <p className={`text-xs mb-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{product.type}</p>
        {product.sellerName && (
          <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>by {product.sellerName}</p>
        )}
        
        {viewMode === 'list' && (
          <div className="flex items-center gap-2 mt-2">
            <button className={`p-1.5 rounded transition-colors duration-200 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}>
              <Eye className="w-4 h-4" />
            </button>
            <button className={`p-1.5 rounded transition-colors duration-200 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-green-400 hover:bg-green-900' 
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}>
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDeleteProduct(product._id)}
              className={`p-1.5 rounded transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-900' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {viewMode === 'grid' && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>4.5</span>
            </div>
            <div className="flex items-center gap-1">
              <button className={`p-1.5 rounded transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}>
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button className={`p-1.5 rounded transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-green-400 hover:bg-green-900' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}>
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button 
                onClick={() => handleDeleteProduct(product._id)}
                className={`p-1.5 rounded transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-900' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  };

  // My Products Page
  const MyProductsPage: React.FC = () => (
    <div className="p-4 sm:p-6 lg:p-8">
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Loading products...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 min-h-64 flex items-center justify-center">{error}</div>
      ) : products.length === 0 ? (
        <div className={`min-h-64 flex flex-col items-center justify-center text-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-200 ${isDarkMode ? 'bg-red-900' : 'bg-red-100'}`}>
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
          <h3 className={`text-lg sm:text-xl font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No products yet</h3>
          <p className={`text-sm sm:text-base mb-4 sm:mb-6 max-w-md transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start selling by adding your first product to the marketplace.</p>
          <button
            onClick={() => setShowSellModal(true)}
            className="bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            Sell new product
          </button>
        </div>
      ) : (
        <div>
          {/* Products Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className={`text-lg sm:text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Products</h2>
              <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{products.length} product{products.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}>
                <Search className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <button className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}>
                <Filter className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              {/* View Mode Toggle */}
              <div className={`hidden sm:flex rounded-lg p-1 transition-colors duration-200 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? isDarkMode 
                        ? 'bg-gray-600 shadow-sm' 
                        : 'bg-white shadow-sm'
                      : isDarkMode 
                        ? 'hover:bg-gray-600' 
                        : 'hover:bg-gray-200'
                  }`}
                >
                  <Package className={`w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? isDarkMode 
                        ? 'bg-gray-600 shadow-sm' 
                        : 'bg-white shadow-sm'
                      : isDarkMode 
                        ? 'hover:bg-gray-600' 
                        : 'hover:bg-gray-200'
                  }`}
                >
                  <Menu className={`w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>
              {/* Sell new product button always visible */}
              <button
                onClick={() => setShowSellModal(true)}
                className="bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Sell new product
              </button>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6' 
            : 'space-y-3'
          }>
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Purchased Page
  const PurchasedPage: React.FC = () => (
    <div className={`min-h-64 flex flex-col items-center justify-center p-6 sm:p-8 text-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-200 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
        <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
      </div>
      <h3 className={`text-lg sm:text-xl font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No purchases yet</h3>
      <p className={`text-sm sm:text-base transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your purchased items will appear here.</p>
    </div>
  );

  const renderContent = (): React.ReactElement => {
    switch (activeTab) {
      case 'My Products':
        return <MyProductsPage />;
      case 'Purchased':
        return <PurchasedPage />;
      default:
        return <MyProductsPage />;
    }
  };

  return (
    <div className={`w-full relative transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`shadow-sm border-b z-30 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className={`lg:hidden p-2 rounded-full transition-colors duration-200 ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}>
                <ArrowLeft className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <h1 className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My-Product</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}>
                <Camera className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <button className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}>
                <Users className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className={`sm:hidden p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Menu className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div className={`absolute right-0 top-0 h-full w-64 shadow-xl transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-4 border-b transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {tabs.map((tab: Tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                    activeTab === tab.name
                      ? 'bg-blue-50 text-blue-600'
                      : isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Desktop */}
      <nav className={`hidden sm:block border-b transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab: Tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.name
                    ? 'text-blue-600 border-blue-600'
                    : isDarkMode 
                      ? 'text-gray-300 border-transparent hover:text-blue-400' 
                      : 'text-gray-500 border-transparent hover:text-blue-600'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`relative transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {renderContent()}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] pointer-events-none">
        <button 
          onClick={() => setShowSellModal(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all flex items-center justify-center group pointer-events-auto"
          style={{ 
            position: 'relative',
            width: '3rem',
            height: '3rem',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Sell New Product Modal */}
      {showSellModal && (
        <div className="fixed inset-0 modal-glassmorphism-bg flex items-center justify-center p-2 sm:p-4 z-50">
          <div 
            className={`rounded-2xl shadow-2xl w-full max-w-[90vw] sm:max-w-lg lg:max-w-xl max-h-[70vh] sm:max-h-[80vh] overflow-y-auto scrollbar-hide transition-all duration-300 transform border ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700/50 backdrop-blur-xl' 
                : 'bg-white/80 border-gray-300/50 backdrop-blur-xl'
            }`}
            style={{
              boxShadow: isDarkMode 
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' 
                : '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-lg sm:text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sell new product</h2>
              <button
                onClick={handleCancel}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-4">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product in detail"
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
                <p className={`text-xs mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Minimum 10 characters</p>
              </div>

              {/* Price Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {currencies.map((currency: string) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Condition</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {types.map((type: string) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {categories.map((category: string) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantity Available</label>
                <input
                  type="number"
                  name="totalItemUnits"
                  value={formData.totalItemUnits}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Photos */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product Photos</label>
                <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img src={imagePreview} alt="Preview" className="mx-auto h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg" />
                        <p className="text-sm text-blue-600">Click to change photo</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                        <div>
                          <p className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Click to upload photos</p>
                          <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t sticky bottom-0 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={handleCancel}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${
                  isDarkMode 
                    ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base"
              >
                Publish Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Safe Area */}
      <div className="sm:hidden h-safe-area-inset-bottom"></div>

      {/* Delete Success/Error Popup */}
      {showDeletePopup && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg max-w-sm transition-colors duration-200 ${
            deleteMessage.includes('successfully') 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                {deleteMessage.includes('successfully') ? (
                  <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <X className="w-4 h-4" />
                )}
              </div>
              <p className="text-sm font-medium">{deleteMessage}</p>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="ml-auto flex-shrink-0 text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceSeller;
"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, MapPin, ChevronDown, ShoppingCart, Heart, Plus, Users, X } from 'lucide-react';
import Link from "next/link";
import Popup, { PopupState } from '../../../components/Popup';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  imageUrl?: string;
  quantity?: number; // Added quantity for cart
  _id?: string; // Added for potential MongoDB _id
  category?: string; // Added category for filtering
}

const MarketplacePage: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Fetch products from backend
  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log('Fetching products from market...');
      
  const response = await fetch(`${API_URL}/api/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Products fetched for market:', data.length);
      setProducts(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredProducts = filteredProducts.slice(0, 3);

  const categories: string[] = [
    'All',
    'Autos & Vehicles', 
    "Baby & Children's Products",
    'Beauty Products & Services',
    'Computers & Peripherals',
    'Consumer Electronics',
    'Other'
  ];

  const nextSlide = (): void => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = (): void => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = e.target as HTMLImageElement;
    const fallbackDiv = target.nextSibling as HTMLElement;
    if (target && fallbackDiv) {
      target.style.display = 'none';
      fallbackDiv.style.display = 'flex';
    }
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
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    setCart(prev => {
      // If already in cart, increase quantity
      const idx = prev.findIndex(item => item.id === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: (updated[idx].quantity || 1) + 1 };
        return updated;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showPopup('success', 'Added to Cart!', `${product.name} has been added to your cart`);
  };

  return (
    <div className={`w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      
      {/* Header */}
      <header className={`shadow-sm border-b sticky top-0 z-30 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ml-2 mr-3`}>
        <div className="px-1 sm:px-3 lg:px-5 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold flex-shrink-0 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Market</h1>
            
            {/* Search Bar - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
              <div className="relative w-full">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search for products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 lg:pl-10 pr-4 py-2 text-sm lg:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3">
              {/* Refresh Button */}
              <button
                onClick={() => fetchProducts(true)}
                disabled={refreshing}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${refreshing ? 'opacity-50' : ''} ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title="Refresh products"
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search for products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Featured Products Carousel */}
        <section className={`rounded-lg shadow-sm border mb-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 sm:p-6">
            <h2 className={`text-lg sm:text-xl font-bold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Featured Products</h2>
          <div className="relative">
            <div className="flex items-center overflow-hidden">
              {/* Navigation Buttons - Hidden on mobile */}
              <button
                onClick={prevSlide}
                className="hidden sm:flex absolute left-2 lg:left-4 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-black bg-opacity-50 text-white rounded-full items-center justify-center hover:bg-opacity-70 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              
              <div className="flex transition-transform duration-300 ease-in-out w-full">
                {featuredProducts.map((product: Product, index: number) => (
                  <div
                      key={product.id || product._id}
                    className={`flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 px-1 sm:px-2 ${index === currentSlide ? 'block' : 'hidden sm:block'}`}
                  >
                    <div className="bg-gray-100 rounded-lg overflow-hidden h-48 sm:h-56 lg:h-64 flex flex-col">
                      <div className="flex-1 p-3 sm:p-4">
                        <img 
                          src={product.imageUrl || product.image} 
                          alt={product.name}
                          className="w-full h-24 sm:h-28 lg:h-32 object-cover rounded-lg"
                          onError={handleImageError}
                        />
                        <div className="w-full h-24 sm:h-28 lg:h-32 bg-gray-300 rounded-lg hidden items-center justify-center">
                          <span className="text-gray-500 text-xs sm:text-sm">Image</span>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 pt-0">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className="hidden sm:flex absolute right-2 lg:right-4 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-black bg-opacity-50 text-white rounded-full items-center justify-center hover:bg-opacity-70 transition-colors"
              >
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
            
            {/* Mobile Carousel Indicators */}
            <div className="sm:hidden flex justify-center mt-4 gap-2">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Shops Banner */}
        <section className="mb-6">
        <div className="bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg p-4 sm:p-6 flex items-center justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Nearby Shops</h2>
            <p className="text-white opacity-90 mb-3 sm:mb-4 text-sm sm:text-base">
              Find shops near to you based on your location and connect with them directly.
            </p>
            <button 
              className="bg-black text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors"
              onClick={() => showPopup('info', 'Coming Soon!', 'Nearby shops feature will be available soon!')}
            >
              Explore
            </button>
          </div>
          <div className="hidden sm:block">
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
        <section className={`rounded-lg shadow-sm border mb-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((category: string) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap duration-200 ${
                  selectedCategory === category
                    ? 'text-blue-600 border-blue-600'
                    : isDarkMode 
                      ? 'text-gray-300 border-transparent hover:text-blue-400' 
                      : 'text-gray-500 border-transparent hover:text-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
        <section className={`rounded-lg shadow-sm border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 sm:p-6">
        {/* Products Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <h2 className={`text-lg sm:text-xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Products</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <button className="flex items-center gap-2 text-blue-600 font-medium text-sm sm:text-base">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              Location
            </button>
            <button className="flex items-center gap-2 text-gray-600 font-medium text-sm sm:text-base">
              Sort by Latest
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Loading products...</p>
              </div>
        ) : error ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <ShoppingCart className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No products available</h3>
                <p className={`mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Be the first to add a product to the marketplace!</p>
                <button 
                  onClick={() => router.push('/dashboard/products')}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Add Product
                </button>
              </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                {filteredProducts.map((product: Product) => (
              <Link 
                    key={product.id || product._id} 
                    href={`/dashboard/market/checkout/${product.id || product._id}`} 
                className={`rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 block ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`aspect-square rounded-t-lg overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                  <img 
                    src={product.imageUrl || product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  <div className={`w-full h-full hidden items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                    <span className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Image</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 lg:p-4">
                  <h3 className={`text-xs sm:text-sm lg:text-base mb-1 sm:mb-2 line-clamp-2 leading-tight transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>
                  <p className={`text-sm sm:text-base lg:text-lg font-bold mb-2 sm:mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${product.price.toFixed(2)}</p>
                  <div className="flex gap-1 sm:gap-2">
                    <button 
                      className="flex-1 bg-blue-500 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center" 
                      onClick={e => handleAddToCart(product, e)}
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                      <span className="hidden sm:inline ml-1">Cart</span>
                    </button>
                    <button 
                      className="bg-green-500 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center" 
                      onClick={e => {
                        e.preventDefault();
                        showPopup('success', 'Added to Wishlist!', `${product.name} has been added to your wishlist`);
                      }}
                    >
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
            {filteredProducts.length > 0 && (
        <div className="text-center">
          <button 
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm sm:text-base"
            onClick={() => showPopup('info', 'Loading...', 'Loading more products...')}
          >
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            Load more products
          </button>
              </div>
            )}
        </div>
      </section>
      </div>

      {/* Floating Action Buttons */}
      {/* Add Product Button */}
      <button 
        onClick={() => router.push('/dashboard/products')}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-40"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Cart Button */}
      <button
        className="fixed bottom-16 sm:bottom-20 lg:bottom-24 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center z-50"
        onClick={() => router.push('/dashboard/market/checkout')}
      >
        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 sm:px-2 min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold">
            {cart.length}
          </span>
        )}
      </button>

      {/* Custom Scrollbar Hide */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MarketplacePage;

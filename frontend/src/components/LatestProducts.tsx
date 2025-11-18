'use client';
import React, { useState, useEffect } from 'react';
import { Package, Eye } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  type: string;
  sellerName: string;
  createdAt: string;
}

const LatestProducts: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get proper media URL
  const getMediaUrl = (url: string) => {
    if (!url) return '/default-avatar.svg';
    if (url.startsWith('http')) return url;
    
    // Handle localhost URLs that might be stored incorrectly
    if (url.includes('localhost:3000') || url.includes('localhost:3001')) {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error('❌ NEXT_PUBLIC_API_URL is not set!');
        return url;
      }
      const correctedUrl = url.replace(/localhost:\d+/, process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, '')).replace('http://', 'http://');
      console.log('🔗 LatestProducts - Fixed localhost URL:', { original: url, corrected: correctedUrl });
      return correctedUrl;
    }
    
    // Remove leading slash to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error('❌ NEXT_PUBLIC_API_URL is not set!');
      return url;
    }
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/${cleanUrl}`;
    // console.log('📸 LatestProducts - Original:', url, 'Full:', fullUrl);
    return fullUrl;
  };

  useEffect(() => {
  const fetchLatestProducts = async () => {
    try {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${API_URL}/api/products/latest`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Latest products fetched:', data.length);
        setProducts(data);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching latest products:', error);
        setError('Failed to load latest products');
      setLoading(false);
    }
  };

    fetchLatestProducts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Latest Products</h3>
        </div>
        <div className="text-center py-4">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Latest Products</h3>
        </div>
        <div className="text-center py-4">
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{error}</p>
              </div>
            </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Latest Products</h3>
        </div>
        <div className="text-center py-4">
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No products available</p>
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Latest Products</h3>
      </div>
      
      <div className="space-y-3">
        {/* If exactly 2 products, show horizontally */}
        {products.length === 2 ? (
          <div className="grid grid-cols-2 gap-2">
        {products.map((product) => (
              <div key={product._id} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-2 hover:shadow-sm transition-shadow`}>
                <div className="text-center">
                  {product.image ? (
                    <img 
                      src={getMediaUrl(product.image)} 
                      alt={product.name}
                      className="w-full h-20 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className={`w-full h-20 bg-gradient-to-br ${isDarkMode ? 'from-blue-900/20 to-purple-900/20' : 'from-blue-100 to-purple-100'} rounded-lg flex items-center justify-center mb-2`}>
                      <Package className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  )}
                  
                  <h4 className={`font-medium text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate mb-1`}>
                    {product.name}
                  </h4>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {product.currency} {product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* If more than 2 products, show all vertically */
          products.map((product) => (
            <div key={product._id} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-3 hover:shadow-sm transition-shadow`}>
            <div className="flex items-start gap-3">
                {product.image ? (
                <img 
                  src={getMediaUrl(product.image)} 
              alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                ) : (
                  <div className={`w-16 h-16 bg-gradient-to-br ${isDarkMode ? 'from-blue-900/20 to-purple-900/20' : 'from-blue-100 to-purple-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Package className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
              )}
              
          <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate mb-1`}>
              {product.name}
            </h4>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  {product.category} • {product.type}
                </p>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-1`}>
                  {product.currency} {product.price}
                </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  by {product.sellerName}
                </p>
              </div>
              
                <button className={`p-1 text-gray-400 ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'} transition-colors`}>
                <Eye className="w-3 h-3" />
              </button>
          </div>
        </div>
          ))
        )}
        </div>
      
      {products.length > 0 && (
        <div className="text-center pt-2">
          <a 
            href="/dashboard/products" 
            className={`text-xs font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            View all products →
          </a>
        </div>
      )}
    </div>
  );
};

export default LatestProducts; 

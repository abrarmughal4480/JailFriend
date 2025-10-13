'use client';
import React, { useState, useEffect } from 'react';
import { Package, Eye } from 'lucide-react';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchLatestProducts = async () => {
    try {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
  const response = await fetch(`${API_URL}/api/products/latest`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Latest products fetched:', data.length);
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
          <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-sm text-gray-700 dark:text-white">Latest Products</h3>
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
          <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-sm text-gray-700 dark:text-white">Latest Products</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
              </div>
            </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-sm text-gray-700 dark:text-white">Latest Products</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">No products available</p>
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold text-sm text-gray-700 dark:text-white">Latest Products</h3>
      </div>
      
      <div className="space-y-3">
        {/* If exactly 2 products, show horizontally */}
        {products.length === 2 ? (
          <div className="grid grid-cols-2 gap-2">
        {products.map((product) => (
              <div key={product._id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 hover:shadow-sm transition-shadow">
                <div className="text-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-20 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center mb-2">
                      <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  
                  <h4 className="font-medium text-xs text-gray-900 dark:text-white truncate mb-1">
                    {product.name}
                  </h4>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {product.currency} {product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* If more than 2 products, show all vertically */
          products.map((product) => (
            <div key={product._id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
                {product.image ? (
                <img 
                  src={product.image} 
              alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
              )}
              
          <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1">
              {product.name}
            </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {product.category} • {product.type}
                </p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  {product.currency} {product.price}
                </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                  by {product.sellerName}
                </p>
              </div>
              
                <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
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
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View all products →
          </a>
        </div>
      )}
    </div>
  );
};

export default LatestProducts; 

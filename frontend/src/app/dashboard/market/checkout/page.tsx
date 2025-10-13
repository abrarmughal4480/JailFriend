"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;
  quantity: number;
}

const USER_BALANCE = 100; // Simulated user balance

export default function CheckoutPage() {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    country: "",
    city: "",
    zip: "",
    address: "",
  });
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showFAB, setShowFAB] = useState(true);

  useEffect(() => {
    // Load cart from localStorage
    const stored = localStorage.getItem("cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
    // Load addresses from localStorage
    const addr = localStorage.getItem("addresses");
    if (addr) {
      setAddresses(JSON.parse(addr));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage on change
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("addresses", JSON.stringify(addresses));
  }, [addresses]);

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleAddAddress = (e: any) => {
    e.preventDefault();
    setAddresses(prev => [...prev, addressForm]);
    setAddressForm({ name: "", phone: "", country: "", city: "", zip: "", address: "" });
    setSelectedAddress(addresses.length); // select the new address
  };

  const handleQty = (idx: number, delta: number) => {
    setCart(prev => prev.map((item, i) => i === idx ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const handleRemove = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
  const handleOrder = async (e: any) => {
    e.preventDefault();
    setOrderError(null);
    if (total > USER_BALANCE) {
      setOrderError("You don't have enough balance to purchase, please top up your wallet.");
      return;
    }
    if (selectedAddress === null) {
      setOrderError("Please select or add a delivery address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          address: addresses[selectedAddress],
          total,
        }),
      });
      if (res.ok) {
        alert("Order placed successfully!");
        setCart([]);
        localStorage.removeItem("cart");
        router.push("/dashboard/market");
      } else {
        const data = await res.json();
        setOrderError(data.error || "Order failed");
      }
    } catch (err) {
      setOrderError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full scrollbar-hide transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className={`shadow-sm border-b sticky top-0 z-30 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/dashboard/market')}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Checkout</h1>
          </div>
          <div className={`flex items-center gap-2 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Balance:</span>
            <span className="font-semibold text-green-600">${USER_BALANCE}</span>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Address Section */}
          <div className={`flex-1 rounded-lg shadow-sm border p-4 sm:p-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="mb-6">
              <h2 className={`text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📍 Delivery Address
              </h2>
              
              {addresses.length === 0 && (
                <div className={`p-3 rounded-lg mb-4 text-sm transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  Please add a delivery address below to continue with your order
                </div>
              )}
              
              {addresses.length > 0 && (
                <div className="mb-6">
                  <div className="space-y-3">
                    {addresses.map((addr, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer duration-200 ${
                          selectedAddress === idx 
                            ? isDarkMode
                              ? 'border-cyan-500 bg-cyan-900 ring-1 ring-cyan-200'
                              : 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-200'
                            : isDarkMode
                              ? 'border-gray-600 hover:border-gray-500'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAddress(idx)}
                      >
                        <div className="flex items-start gap-3">
                          <input 
                            type="radio" 
                            checked={selectedAddress === idx} 
                            onChange={() => setSelectedAddress(idx)}
                            className="mt-1 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{addr.name}</div>
                            <div className={`text-sm mt-1 break-words transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {addr.address}, {addr.city}, {addr.country} {addr.zip}
                            </div>
                            <div className={`text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{addr.phone}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add New Address Form */}
            <div className={`border-t pt-6 transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Address</h3>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="name"
                    required
                    placeholder="Full Name"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    value={addressForm.name}
                    onChange={handleAddressFormChange}
                  />
                  <input
                    name="phone"
                    required
                    placeholder="Phone Number"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    value={addressForm.phone}
                    onChange={handleAddressFormChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="country"
                    required
                    placeholder="Country"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    value={addressForm.country}
                    onChange={handleAddressFormChange}
                  />
                  <input
                    name="city"
                    required
                    placeholder="City"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    value={addressForm.city}
                    onChange={handleAddressFormChange}
                  />
                </div>
                
                <input
                  name="zip"
                  required
                  placeholder="Zip/Postal Code"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={addressForm.zip}
                  onChange={handleAddressFormChange}
                />
                
                <textarea
                  name="address"
                  required
                  placeholder="Street Address"
                  rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-none duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={addressForm.address}
                  onChange={handleAddressFormChange}
                />
                
                <button 
                  type="submit" 
                  className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                >
                  Add Address
                </button>
              </form>
            </div>
          </div>

          {/* Cart Section */}
          <div className="w-full lg:w-[420px] xl:w-[460px]">
            <div className={`rounded-lg shadow-sm border p-4 sm:p-6 sticky top-24 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  🛒 Shopping Cart
                </h2>
                <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {cart.length} Item{cart.length !== 1 ? 's' : ''}
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🛒</div>
                  <div className={`mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your cart is empty</div>
                  <button 
                    onClick={() => router.push('/dashboard/market')}
                    className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors duration-200"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                    <div className="space-y-4">
                      {cart.map((item, idx) => (
                        <div key={item.id} className={`flex gap-3 items-start border-b pb-4 last:border-b-0 transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <img 
                            src={item.imageUrl || item.image} 
                            alt={item.name} 
                            className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg flex-shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm sm:text-base truncate transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                            <div className="text-cyan-600 font-bold text-sm sm:text-base">${item.price}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Qty:</span>
                              <div className="flex items-center gap-1">
                                <button 
                                  type="button" 
                                  className={`w-7 h-7 rounded text-sm font-medium transition-colors duration-200 ${
                                    isDarkMode 
                                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                  onClick={() => handleQty(idx, -1)}
                                >
                                  -
                                </button>
                                <span className={`w-8 text-center text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                                <button 
                                  type="button" 
                                  className={`w-7 h-7 rounded text-sm font-medium transition-colors duration-200 ${
                                    isDarkMode 
                                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                  onClick={() => handleQty(idx, 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            className={`text-xl p-1 transition-colors duration-200 ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-red-500' 
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                            onClick={() => handleRemove(idx)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`border-t pt-4 mt-4 transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`font-bold text-lg transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total:</span>
                      <span className="font-bold text-xl sm:text-2xl text-cyan-700">${total.toFixed(2)}</span>
                    </div>

                    {orderError && (
                      <div className={`p-3 rounded-lg mb-4 text-sm text-center transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-red-900 text-red-300' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {orderError}
                      </div>
                    )}

                    {total > USER_BALANCE && (
                      <div className={`p-3 rounded-lg mb-4 text-sm text-center transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-red-900 text-red-300' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        Insufficient balance. Please top up your wallet.
                      </div>
                    )}

                    <button
                      onClick={handleOrder}
                      disabled={loading || cart.length === 0 || total > USER_BALANCE || selectedAddress === null}
                      className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Only show on mobile when scrolled */}
      {showFAB && (
        <button
          className="fixed bottom-6 right-6 w-12 h-12 sm:w-14 sm:h-14 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-200 flex items-center justify-center z-50 lg:hidden"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
        }
        
        /* Completely fixed page - no scrolling */
        body {
          overflow: hidden;
          margin: 0;
          padding: 0;
          height: 100vh;
          width: 100vw;
        }
        
        html {
          overflow: hidden;
          height: 100vh;
          width: 100vw;
        }
        
        /* Ensure content doesn't overflow */
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

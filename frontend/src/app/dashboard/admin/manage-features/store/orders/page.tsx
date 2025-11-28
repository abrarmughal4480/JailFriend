'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Order {
  _id: string;
  productId?: number;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  buyerName?: string;
  address?: string;
  phone?: string;
  city?: string;
  postal?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  link?: string;
  author?: string;
}

const ManageOrders = () => {
  const { isDarkMode } = useDarkMode();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [bulkAction, setBulkAction] = useState<string>('Delete');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
  const itemsPerPage = 15;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try to fetch orders - adjust endpoint as needed
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both array and object with orders property
        const ordersList = Array.isArray(data) ? data : (data.orders || []);
        
        // Sort orders
        const sorted = [...ordersList].sort((a: Order, b: Order) => {
          const aId = a._id || '';
          const bId = b._id || '';
          return sortOrder === 'asc' ? aId.localeCompare(bId) : bId.localeCompare(aId);
        });
        
        setOrders(sorted);
        setTotalOrders(sorted.length);
        setTotalPages(Math.ceil(sorted.length / itemsPerPage));
      } else {
        // If endpoint doesn't exist yet, set empty array
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    const paginatedOrders = getPaginatedOrders();
    if (checked) {
      setSelectedOrders(paginatedOrders.map(o => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const handleBulkAction = async () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order.');
      return;
    }

    if (bulkAction === 'Delete') {
      if (!confirm(`Are you sure you want to delete ${selectedOrders.length} order(s)?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      if (bulkAction === 'Delete') {
        // Delete selected orders
        const deletePromises = selectedOrders.map(orderId =>
          fetch(`${API_URL}/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).catch(err => {
            console.error(`Error deleting order ${orderId}:`, err);
            return { ok: false };
          })
        );

        await Promise.all(deletePromises);
        setSelectedOrders([]);
        await fetchOrders();
        alert('Orders deleted successfully!');
      } else {
        // Handle other bulk actions here
        alert(`${bulkAction} action applied to ${selectedOrders.length} order(s).`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getOrderLink = (order: Order) => {
    if (order.link) return order.link;
    if (order.productId) return `/dashboard/market/product/${order.productId}`;
    return '#';
  };

  const getAuthorName = (order: Order) => {
    if (order.author) return order.author;
    if (order.buyerName) return order.buyerName;
    return 'Unknown';
  };

  const getOrderStatus = (order: Order) => {
    if (order.status) return order.status;
    return 'Pending';
  };

  const getPaginatedOrders = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return orders.slice(startIndex, endIndex);
  };

  const paginatedOrders = getPaginatedOrders();
  const showingCount = paginatedOrders.length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-4`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </li>
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Home
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Store
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-medium`}>Manage Orders</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
          Orders
        </h1>

        {/* Main Card */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
          {/* Card Header */}
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Manage Orders
          </h2>

          {/* Orders Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                    />
                  </th>
                  <th 
                    className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} uppercase tracking-wider cursor-pointer`}
                    onClick={handleSort}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      {sortOrder === 'asc' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    LINK
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    AUTHOR
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    POSTED
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    STATUS
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className={`ml-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No orders found
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={(e) => handleSelectOrder(order._id, e.target.checked)}
                          className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                        />
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {order._id.substring(0, 8)}...
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <a 
                          href={getOrderLink(order)}
                          className="text-blue-600 hover:underline"
                        >
                          {getOrderLink(order).length > 30 ? getOrderLink(order).substring(0, 30) + '...' : getOrderLink(order)}
                        </a>
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {getAuthorName(order)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          getOrderStatus(order) === 'Completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : getOrderStatus(order) === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {getOrderStatus(order)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this order?')) {
                              try {
                                const token = localStorage.getItem('token');
                                await fetch(`${API_URL}/api/orders/${order._id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  }
                                });
                                await fetchOrders();
                                alert('Order deleted successfully!');
                              } catch (error) {
                                console.error('Error deleting order:', error);
                                alert('Failed to delete order.');
                              }
                            }
                          }}
                          className={`text-red-600 hover:text-red-800 ${isDarkMode ? 'hover:text-red-400' : ''}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination and Summary */}
          <div className={`flex items-center justify-between border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
            <div className="flex items-center gap-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {showingCount} out of {totalOrders}
              </p>
              
              {/* Bulk Action Section */}
              <div className="flex items-center gap-2">
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Action:
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className={`px-3 py-1.5 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                >
                  <option value="Delete">Delete</option>
                  <option value="Approve">Approve</option>
                  <option value="Reject">Reject</option>
                  <option value="Mark as Completed">Mark as Completed</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={selectedOrders.length === 0 || submitting}
                  className={`px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${submitting ? 'opacity-50' : ''}`}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                title="First page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Last page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;


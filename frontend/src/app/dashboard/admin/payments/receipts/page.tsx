'use client';
import React, { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface BankReceipt {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        avatar: string;
    };
    amount: number;
    receiptUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    processedAt?: string;
    processedBy?: string;
}

export default function ManageBankReceiptsPage() {
    const { isDarkMode } = useDarkMode();
    const [receipts, setReceipts] = useState<BankReceipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedReceipt, setSelectedReceipt] = useState<BankReceipt | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchReceipts();
    }, [filter]);

    const fetchReceipts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            console.log('Fetching receipts with filter:', filter);
            console.log('API URL:', `${API_URL}/api/admin/bank-receipts?status=${filter}`);

            const response = await fetch(`${API_URL}/api/admin/bank-receipts?status=${filter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Received data:', data);
                console.log('Receipts count:', data.receipts?.length || 0);
                setReceipts(data.receipts || []);
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
            }
        } catch (error) {
            console.error('Error fetching receipts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (receiptId: string) => {
        if (!confirm('Are you sure you want to approve this receipt? This will add funds to the user\'s balance.')) {
            return;
        }

        setProcessing(receiptId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/bank-receipts/${receiptId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Receipt approved successfully! User balance has been updated.');
                // Trigger balance update event for the user
                window.dispatchEvent(new Event('balanceUpdated'));
                fetchReceipts();
                setSelectedReceipt(null);
            } else {
                const error = await response.json();
                alert(`Failed to approve receipt: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error approving receipt:', error);
            alert('Error approving receipt. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (receiptId: string) => {
        const reason = prompt('Please provide a reason for rejection (optional):');

        setProcessing(receiptId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/bank-receipts/${receiptId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                alert('Receipt rejected successfully.');
                fetchReceipts();
                setSelectedReceipt(null);
            } else {
                const error = await response.json();
                alert(`Failed to reject receipt: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error rejecting receipt:', error);
            alert('Error rejecting receipt. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    const formatAmount = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const approvedCount = receipts.filter(r => r.status === 'approved').length;
    const rejectedCount = receipts.filter(r => r.status === 'rejected').length;

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-6`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Manage bank receipts
                    </h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        🏠 Manage bank receipts
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg flex items-center gap-4`}>
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                            <span className="text-3xl">🧾</span>
                        </div>
                        <div>
                            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {approvedCount}
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Approved receipts
                            </p>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg flex items-center gap-4`}>
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                            <span className="text-3xl">🗑️</span>
                        </div>
                        <div>
                            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {rejectedCount}
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Disapproved receipts
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
                    <div className="p-6">
                        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Manage bank receipts
                        </h2>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Loading receipts...
                                </div>
                            </div>
                        ) : receipts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    No data available in table
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                USER
                                            </th>
                                            <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                PRICE
                                            </th>
                                            <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                CREATED
                                            </th>
                                            <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                RECEIPT
                                            </th>
                                            <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                ACTION
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receipts.map((receipt) => (
                                            <tr 
                                                key={receipt._id}
                                                className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={receipt.userId.avatar || '/default-avatar.svg'}
                                                            alt={receipt.userId.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                {receipt.userId.name}
                                                            </div>
                                                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {receipt.userId.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`py-4 px-4 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {formatAmount(receipt.amount)}
                                                </td>
                                                <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {formatDate(receipt.createdAt)}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <button
                                                        onClick={() => setSelectedReceipt(receipt)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        📄 Show Receipt
                                                    </button>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {receipt.status === 'pending' ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleApprove(receipt._id)}
                                                                disabled={processing === receipt._id}
                                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(receipt._id)}
                                                                disabled={processing === receipt._id}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                            receipt.status === 'approved' 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        }`}>
                                                            {receipt.status.toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {receipts.length > 0 && (
                        <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Showing 1 out of 1
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                    ❮❮
                                </button>
                                <button className="w-8 h-8 rounded bg-blue-500 text-white font-medium">
                                    1
                                </button>
                                <button className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                    ❯❯
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Receipt Preview Modal */}
            {selectedReceipt && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedReceipt(null)}
                >
                    <div
                        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Receipt Details
                                </h2>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {selectedReceipt.userId.name} - {formatAmount(selectedReceipt.amount)}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedReceipt(null)}
                                className={`text-2xl ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                ×
                            </button>
                        </div>

                        <img
                            src={selectedReceipt.receiptUrl}
                            alt="Receipt"
                            className="w-full rounded-lg mb-4"
                        />

                        {selectedReceipt.status === 'pending' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleApprove(selectedReceipt._id)}
                                    disabled={processing === selectedReceipt._id}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {processing === selectedReceipt._id ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                    onClick={() => handleReject(selectedReceipt._id)}
                                    disabled={processing === selectedReceipt._id}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

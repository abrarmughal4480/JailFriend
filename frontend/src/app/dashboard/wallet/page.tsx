'use client';
import React, { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Transaction {
    _id: string;
    type: string;
    status: string;
    date: string;
    amount: number;
}

interface AddFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: (amount: number) => void;
    isDarkMode: boolean;
}

const AddFundsModal: React.FC<AddFundsModalProps> = ({ isOpen, onClose, onContinue, isDarkMode }) => {
    const [amount, setAmount] = useState<string>('0');

    if (!isOpen) return null;

    const handleContinue = () => {
        const numAmount = parseFloat(amount);
        if (numAmount > 0) {
            onContinue(numAmount);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]" onClick={onClose}>
            <div
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Replenish my balance
                </h2>

                <div className="mb-8">
                    <div className={`text-6xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹<input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={`w-full text-center bg-transparent border-none outline-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                <button
                    onClick={handleContinue}
                    disabled={parseFloat(amount) <= 0}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Continue
                </button>
            </div>
        </div>
    );
};

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    isDarkMode: boolean;
    onSelectMethod: (methodId: string) => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ isOpen, onClose, amount, isDarkMode, onSelectMethod }) => {
    const paymentMethods = [
        { id: 'paypal', name: 'PayPal', icon: '💳' },
        { id: 'qiwi', name: 'Qiwi', icon: '🟢' },
        { id: 'credit-card', name: 'Credit Card', icon: '💳' },
        { id: 'bank-transfer', name: 'Bank transfer', icon: '🏦' },
        { id: 'bitcoin', name: 'Bitcoin', icon: '₿' },
        { id: 'alipay', name: 'Alipay', icon: '💙' },
        { id: '2checkout', name: '2Checkout', icon: '✓' },
        { id: 'paystack', name: 'Paystack', icon: '📊' },
        { id: 'cashfree', name: 'Cashfree', icon: '💵' },
        { id: 'flutterwave', name: 'Flutterwave', icon: '🦋' },
        { id: 'coingate', name: 'Coingate', icon: '🪙' },
        { id: 'aamarapay', name: 'Aamarapay', icon: '🇧🇩' },
        { id: 'ngenius', name: 'Ngenius', icon: '⚡' },
        { id: 'iyzico', name: 'Iyzico', icon: '🇹🇷' },
        { id: 'payfast', name: 'PayFast', icon: '⚡' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]" onClick={onClose}>
            <div
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Choose a payment method
                </h2>

                <div className="space-y-2">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${isDarkMode
                                    ? 'hover:bg-gray-700 text-white'
                                    : 'hover:bg-gray-100 text-gray-900'
                                }`}
                            onClick={() => {
                                onSelectMethod(method.id);
                                onClose();
                            }}
                        >
                            <span className="text-xl">{method.icon}</span>
                            <span className="font-medium">{method.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Bank Transfer Modal
interface BankTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    isDarkMode: boolean;
}

const BankTransferModal: React.FC<BankTransferModalProps> = ({ isOpen, onClose, amount, isDarkMode }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSend = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('receipt', selectedFile);
            formData.append('amount', amount.toString());
            formData.append('paymentMethod', 'bank-transfer');

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/wallet/bank-transfer`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Receipt uploaded successfully! Your payment will be verified within 3 working days.');
                onClose();
            } else {
                alert('Failed to upload receipt. Please try again.');
            }
        } catch (error) {
            console.error('Error uploading receipt:', error);
            alert('Error uploading receipt. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]" onClick={onClose}>
            <div
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Bank transfer
                </h2>

                {/* Bank Details Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 mb-4 text-white">
                    <h3 className="text-lg font-bold mb-2">Garanti Bank</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-2xl font-bold">4796824372433055</div>
                            <div className="text-xs opacity-80">ACCOUNT NUMBER / IBAN</div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold">Antoian Kordiyal</div>
                            <div className="text-xs opacity-80">ACCOUNT NAME</div>
                        </div>
                        <div className="flex justify-between">
                            <div>
                                <div className="font-semibold">TGBATRISXXX</div>
                                <div className="text-xs opacity-80">ROUTING CODE</div>
                            </div>
                            <div>
                                <div className="font-semibold">United States</div>
                                <div className="text-xs opacity-80">COUNTRY</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        • In order to confirm the bank transfer, you will need to upload a receipt or take a screenshot of your transfer within 1 day from your payment date. If a bank transfer is made but no receipt is uploaded within this period, your order will be cancelled. We will verify and confirm your receipt within 3 working days from the date you upload it.
                    </p>
                </div>

                {/* Upload Area */}
                <div className="mb-4">
                    <label className={`block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDarkMode
                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }`}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <div className={`text-4xl mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>📁</div>
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedFile ? selectedFile.name : 'Browse To Upload'}
                        </div>
                    </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!selectedFile || uploading}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2Checkout Modal
interface TwoCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    isDarkMode: boolean;
}

const TwoCheckoutModal: React.FC<TwoCheckoutModalProps> = ({ isOpen, onClose, amount, isDarkMode }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        state: '',
        country: '',
        cardNumber: '',
        month: '',
        year: '',
        cvc: ''
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        alert(`Processing payment of ₹${amount} via 2Checkout`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]" onClick={onClose}>
            <div
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    2Checkout
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                        />
                        <input
                            type="email"
                            placeholder="E-mail"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                        />
                        <input
                            type="tel"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                        />
                        <input
                            type="text"
                            placeholder="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="City"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                            />
                            <input
                                type="text"
                                placeholder="Zip Code"
                                value={formData.zipCode}
                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="State"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                            />
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                            >
                                <option value="">Select Country</option>
                                <option value="US">United States</option>
                                <option value="IN">India</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Column - Card Details */}
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Card Number"
                            value={formData.cardNumber}
                            onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                        />
                        <input
                            type="text"
                            placeholder="month"
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                        />
                        <input
                            type="text"
                            placeholder="year"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                        />
                        <input
                            type="text"
                            placeholder="CVC"
                            value={formData.cvc}
                            onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className={`py-3 px-6 rounded-lg font-medium transition-colors ${isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                        Pay Now
                    </button>
                </div>
            </div>
        </div>
    );
};

// Paystack Modal
interface PaystackModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    isDarkMode: boolean;
}

const PaystackModal: React.FC<PaystackModalProps> = ({ isOpen, onClose, amount, isDarkMode }) => {
    const [email, setEmail] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        alert(`Processing payment of ₹${amount} via Paystack for ${email}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]" onClick={onClose}>
            <div
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Paystack
                </h2>

                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                />

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className={`py-3 px-6 rounded-lg font-medium transition-colors ${isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                        Pay Now
                    </button>
                </div>
            </div>
        </div>
    );
};

// Cashfree Modal
interface CashfreeModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    isDarkMode: boolean;
}

const CashfreeModal: React.FC<CashfreeModalProps> = ({ isOpen, onClose, amount, isDarkMode }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        alert(`Processing payment of ₹${amount} via Cashfree`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]" onClick={onClose}>
            <div
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Cashfree
                </h2>

                <div className="space-y-4 mb-6">
                    <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                    />
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                    />
                    <input
                        type="tel"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                    />
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className={`py-3 px-6 rounded-lg font-medium transition-colors ${isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                        Pay Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function WalletPage() {
    const { isDarkMode } = useDarkMode();
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [showPaymentMethod, setShowPaymentMethod] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number>(0);

    // Payment modals
    const [showBankTransfer, setShowBankTransfer] = useState(false);
    const [show2Checkout, setShow2Checkout] = useState(false);
    const [showPaystack, setShowPaystack] = useState(false);
    const [showCashfree, setShowCashfree] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_URL}/api/wallet`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBalance(data.balance || 0);
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        }
    };

    const formatAmount = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleAddFundsContinue = (amount: number) => {
        setSelectedAmount(amount);
        setShowAddFunds(false);
        setShowPaymentMethod(true);
    };

    const handleSelectPaymentMethod = (methodId: string) => {
        switch (methodId) {
            case 'paypal':
                alert('PayPal app not set yet');
                break;
            case 'bank-transfer':
                setShowBankTransfer(true);
                break;
            case '2checkout':
                setShow2Checkout(true);
                break;
            case 'paystack':
                setShowPaystack(true);
                break;
            case 'cashfree':
                setShowCashfree(true);
                break;
            default:
                alert(`${methodId} integration coming soon`);
        }
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-6`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Wallet
                </h1>

                {/* Balance Card */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 sm:p-8 mb-6 shadow-lg`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Current balance
                            </p>
                            <p className={`text-4xl sm:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatAmount(balance)}
                            </p>
                        </div>

                        <div className="flex gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => setShowAddFunds(true)}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-green-50 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl group-hover:scale-110 transition-transform">
                                    💰
                                </div>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Add Funds
                                </span>
                            </button>

                            <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-blue-50 transition-colors group">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl group-hover:scale-110 transition-transform">
                                    💸
                                </div>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Send money
                                </span>
                            </button>

                            <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-red-50 transition-colors group">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-2xl group-hover:scale-110 transition-transform">
                                    💵
                                </div>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Withdrawal
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transactions */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
                    <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Transactions
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</th>
                                    <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                                    <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                                    <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? (
                                    transactions.map((transaction) => (
                                        <tr
                                            key={transaction._id}
                                            className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} hover:bg-opacity-50 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{transaction.type}</td>
                                            <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{transaction.status}</td>
                                            <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {new Date(transaction.date).toLocaleString()}
                                            </td>
                                            <td className={`py-3 px-4 text-right font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {formatAmount(transaction.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className={`py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            No transactions yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddFundsModal
                isOpen={showAddFunds}
                onClose={() => setShowAddFunds(false)}
                onContinue={handleAddFundsContinue}
                isDarkMode={isDarkMode}
            />

            <PaymentMethodModal
                isOpen={showPaymentMethod}
                onClose={() => setShowPaymentMethod(false)}
                amount={selectedAmount}
                isDarkMode={isDarkMode}
                onSelectMethod={handleSelectPaymentMethod}
            />

            <BankTransferModal
                isOpen={showBankTransfer}
                onClose={() => setShowBankTransfer(false)}
                amount={selectedAmount}
                isDarkMode={isDarkMode}
            />

            <TwoCheckoutModal
                isOpen={show2Checkout}
                onClose={() => setShow2Checkout(false)}
                amount={selectedAmount}
                isDarkMode={isDarkMode}
            />

            <PaystackModal
                isOpen={showPaystack}
                onClose={() => setShowPaystack(false)}
                amount={selectedAmount}
                isDarkMode={isDarkMode}
            />

            <CashfreeModal
                isOpen={showCashfree}
                onClose={() => setShowCashfree(false)}
                amount={selectedAmount}
                isDarkMode={isDarkMode}
            />
        </div>
    );
}

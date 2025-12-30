"use client";

import React from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { AlertCircle, Zap, Wallet, Info } from 'lucide-react';

interface AICreditConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    actionType: 'text' | 'image';
    currentCredits: number;
    actionCost: number;
    creditPrice: number;
    userBalance: number;
    isGenerating: boolean;
}

const AICreditConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    actionType,
    currentCredits,
    actionCost,
    creditPrice,
    userBalance,
    isGenerating
}: AICreditConfirmationProps) => {
    const { isDarkMode } = useDarkMode();

    if (!isOpen) return null;

    const remainingCredits = Math.max(0, currentCredits - actionCost);
    const creditsToBuy = Math.max(0, actionCost - currentCredits);
    const costFromWallet = creditsToBuy * creditPrice;
    const isInsufficientWallet = costFromWallet > userBalance;

    const cardBase = isDarkMode
        ? "bg-gray-800 border-gray-700 text-white"
        : "bg-white border-gray-200 text-gray-900";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`${cardBase} w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300`}>
                {/* Header */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} bg-gradient-to-r ${actionType === 'text' ? 'from-blue-500/10 to-transparent' : 'from-purple-500/10 to-transparent'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${actionType === 'text' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">AI Action Confirmation</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {actionType === 'text' ? 'Text Generation' : 'Image Generation'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Current Credits</p>
                            <p className="text-lg font-bold">{currentCredits}</p>
                        </div>
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Action Cost</p>
                            <p className="text-lg font-bold text-red-500">{actionCost} Credits</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Credits after action</span>
                            <span className={`font-semibold ${remainingCredits > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                                {remainingCredits}
                            </span>
                        </div>

                        {creditsToBuy > 0 && (
                            <div className={`p-4 rounded-xl border ${isDarkMode ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-200 bg-amber-50'} space-y-2`}>
                                <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
                                    <Info className="w-4 h-4" />
                                    <span>Insufficient Credits</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    You need <span className="font-bold">{creditsToBuy}</span> more credits.
                                    These will be purchased automatically from your wallet balance.
                                </p>
                                <div className="flex justify-between items-center pt-2 border-t border-amber-500/20">
                                    <span className="text-sm font-medium">Automatic Cost:</span>
                                    <span className="text-sm font-bold text-amber-500">${costFromWallet.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {isInsufficientWallet && creditsToBuy > 0 && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs mt-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>Insufficient wallet balance. You have ${userBalance.toFixed(2)} but need ${costFromWallet.toFixed(2)}.</p>
                            </div>
                        )}
                    </div>

                    {!isInsufficientWallet && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 italic bg-gray-100 dark:bg-gray-900/30 p-2 rounded">
                            <Wallet className="w-3" />
                            Current Wallet Balance: ${userBalance.toFixed(2)}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-6 flex gap-3 ${isDarkMode ? 'bg-gray-900/30' : 'bg-gray-50/50'}`}>
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            } disabled:opacity-50`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isGenerating || (creditsToBuy > 0 && isInsufficientWallet)}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg ${actionType === 'text'
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                            } disabled:opacity-50 disabled:grayscale disabled:shadow-none`}
                    >
                        {isGenerating ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            'Confirm & Proceed'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AICreditConfirmation;

"use client";
import React, { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { adminApi } from '@/utils/adminApi';

interface FAQ {
  question: string;
  answer: string;
}

const AdminFAQs = () => {
  const { isDarkMode } = useDarkMode();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getFAQs();
      
      if (data.success && data.faqs) {
        setFaqs(data.faqs);
      } else if (data.success && data.faqs === undefined) {
        // If API returns success but no FAQs, use empty array
        setFaqs([]);
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load FAQs');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Frequently Asked Questions
        </h1>
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">FAQS</span>
        </div>
      </div>

      {/* FAQs List */}
      {loading ? (
        <div className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className={`mt-4 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Loading FAQs...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
          isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
        }`}>
          <p className={`transition-colors duration-200 ${
            isDarkMode ? 'text-red-300' : 'text-red-800'
          }`}>
            {error}
          </p>
        </div>
      ) : faqs.length === 0 ? (
        <div className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-center transition-colors duration-200 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No FAQs available
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {faq.question}
            </h3>
            <p className={`transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {faq.answer}
            </p>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default AdminFAQs; 

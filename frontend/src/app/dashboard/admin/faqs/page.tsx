"use client";
import React from 'react';

const AdminFAQs = () => {
  const faqs = [
    { question: "How do I manage user accounts?", answer: "You can manage user accounts through the Users section in the admin dashboard. This includes viewing, editing, and managing user permissions." },
    { question: "How can I configure payment settings?", answer: "Payment settings can be configured in the Payments & Ads section. This includes setting up payment gateways and managing currencies." },
    { question: "How do I add new languages?", answer: "New languages can be added through the Languages section. You can add translation keys and manage existing language files." },
    { question: "How can I monitor system performance?", answer: "System performance can be monitored through the System Status page, which shows real-time metrics and server health." },
    { question: "How do I manage site themes?", answer: "Site themes can be managed in the Design section. You can customize themes and add custom CSS/JS code." },
    { question: "How can I send mass notifications?", answer: "Mass notifications can be sent through the Tools section using the Mass Notifications feature." }
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Frequently Asked Questions
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Home {'>'} Admin {'>'} <span className="text-red-500 dark:text-red-400 font-semibold">FAQS</span>
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {faq.question}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFAQs; 

"use client";
import React from 'react';

const SubscriptionPage = () => {
  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-gray-900">
            Subscriptions
          </h1>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center min-h-[400px] py-12 px-6">
          <div className="w-16 h-16 mb-6 opacity-60">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full fill-gray-500"
            >
              <path 
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M14 2v6h6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M16 13H8" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M16 17H8" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M10 9H8" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-base text-gray-600 font-normal">
            You didn't subscribe to any users yet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;

"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";

const CustomJSCSSPage = () => {
  const { isDarkMode } = useDarkMode();

  const [headerJS, setHeaderJS] = useState(`/*
Add here your JavaScript Code.
Note. the code entered here will be added in <head> tag

Example:

var x, y, z;
x = 5;
y = 6;
z = x + y;
*/`);

  const [footerJS, setFooterJS] = useState(`/*
The code entered here will be added in <footer> tag
*/`);

  const [headerCSS, setHeaderCSS] = useState(`/*
Add here your custom css styles Example: p { text-align: center; color: red; }
*/`);

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";

  const handleSave = () => {
    // TODO: Implement save functionality
    alert("Custom JS/CSS saved successfully!");
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
          Custom JS / CSS
        </h1>
        <div
          className={`text-sm ${textSecondary} flex items-center space-x-2`}
        >
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            🏠
          </span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Design</span>
          <span>&gt;</span>
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            Custom JS / CSS
          </span>
        </div>
      </div>

      <div className="max-w-6xl space-y-6">
        {/* Header Custom JavaScript */}
        <div className={`${cardBase} rounded-xl p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-4`}>
            Header Custom JavaScript
          </h2>
          <textarea
            value={headerJS}
            onChange={(e) => setHeaderJS(e.target.value)}
            className={`w-full h-64 font-mono text-sm ${
              isDarkMode
                ? "bg-gray-900 text-gray-100 border-gray-600"
                : "bg-gray-50 text-gray-900 border-gray-300"
            } border rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none`}
            placeholder="/* Add your JavaScript code here */"
            spellCheck={false}
          />
          <p className={`text-xs ${textSecondary} mt-2`}>
            The code entered here will be added in &lt;head&gt; tag
          </p>
        </div>

        {/* Footer Custom JavaScript */}
        <div className={`${cardBase} rounded-xl p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-4`}>
            Footer Custom JavaScript
          </h2>
          <textarea
            value={footerJS}
            onChange={(e) => setFooterJS(e.target.value)}
            className={`w-full h-64 font-mono text-sm ${
              isDarkMode
                ? "bg-gray-900 text-gray-100 border-gray-600"
                : "bg-gray-50 text-gray-900 border-gray-300"
            } border rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none`}
            placeholder="/* Add your JavaScript code here */"
            spellCheck={false}
          />
          <p className={`text-xs ${textSecondary} mt-2`}>
            The code entered here will be added in &lt;footer&gt; tag
          </p>
        </div>

        {/* Header CSS Style */}
        <div className={`${cardBase} rounded-xl p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-4`}>
            Header CSS Style
          </h2>
          <textarea
            value={headerCSS}
            onChange={(e) => setHeaderCSS(e.target.value)}
            className={`w-full h-64 font-mono text-sm ${
              isDarkMode
                ? "bg-gray-900 text-gray-100 border-gray-600"
                : "bg-gray-50 text-gray-900 border-gray-300"
            } border rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none`}
            placeholder="/* Add your CSS styles here */"
            spellCheck={false}
          />
          <p className={`text-xs ${textSecondary} mt-2`}>
            Add here your custom CSS styles. Example: p &#123; text-align: center; color: red; &#125;
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomJSCSSPage;




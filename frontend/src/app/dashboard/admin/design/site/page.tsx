"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Paperclip, Camera } from "lucide-react";

const ChangeSiteDesignPage = () => {
  const { isDarkMode } = useDarkMode();

  // File uploads
  const [favicon, setFavicon] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [sunshineNightLogo, setSunshineNightLogo] = useState<File | null>(null);

  // Header colors
  const [headerBgColor, setHeaderBgColor] = useState("#1e2321");
  const [headerIconsTextColor, setHeaderIconsTextColor] = useState("#ffffff");
  const [headerSearchBgColor, setHeaderSearchBgColor] = useState("#0f1110");
  const [headerIconsShadowColor, setHeaderIconsShadowColor] = useState("#ffffff");

  // Body colors
  const [bodyBgColor, setBodyBgColor] = useState("#f0f2f5");

  // Button colors
  const [buttonTextColor, setButtonTextColor] = useState("#ffffff");
  const [buttonBgColor, setButtonBgColor] = useState("#c64d53");
  const [buttonHoverTextColor, setButtonHoverTextColor] = useState("#ffffff");
  const [buttonHoverBgColor, setButtonHoverBgColor] = useState("#dd6a70");
  const [buttonDisabledBgColor, setButtonDisabledBgColor] = useState("#c64d53");

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";
  const textTertiary = isDarkMode ? "text-gray-400" : "text-gray-500";

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    alert("Design settings saved successfully! Please clear your browser cache.");
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
          Change Site Design
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
            Change Site Design
          </span>
        </div>
      </div>

      <div className="max-w-4xl">
        {/* Change Site Design Section */}
        <div className={`${cardBase} rounded-xl p-6 mb-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Change Site Design
          </h2>

          <div className="space-y-4">
            {/* Favicon */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 border-2 ${
                  isDarkMode ? "border-red-500" : "border-red-500"
                } rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Paperclip
                  className={`w-6 h-6 ${
                    isDarkMode ? "text-red-400" : "text-red-500"
                  }`}
                />
              </div>
              <div className="flex-1">
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Favicon
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setFavicon)}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <label
                    htmlFor="favicon-upload"
                    className={`px-4 py-2 ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
                        : "bg-white hover:bg-gray-50 border-gray-300"
                    } border rounded-lg cursor-pointer transition-colors text-sm`}
                  >
                    {favicon ? favicon.name : "No file chosen"}
                  </label>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 border-2 ${
                  isDarkMode ? "border-red-500" : "border-red-500"
                } rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Camera
                  className={`w-6 h-6 ${
                    isDarkMode ? "text-red-400" : "text-red-500"
                  }`}
                />
              </div>
              <div className="flex-1">
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Logo (470x75)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setLogo)}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`px-4 py-2 ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
                        : "bg-white hover:bg-gray-50 border-gray-300"
                    } border rounded-lg cursor-pointer transition-colors text-sm`}
                  >
                    {logo ? logo.name : "No file chosen"}
                  </label>
                </div>
              </div>
            </div>

            {/* Sunshine Night Mode Logo */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 border-2 ${
                  isDarkMode ? "border-red-500" : "border-red-500"
                } rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Camera
                  className={`w-6 h-6 ${
                    isDarkMode ? "text-red-400" : "text-red-500"
                  }`}
                />
              </div>
              <div className="flex-1">
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Sunshine Night Mode Logo (470x75)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setSunshineNightLogo)}
                    className="hidden"
                    id="sunshine-logo-upload"
                  />
                  <label
                    htmlFor="sunshine-logo-upload"
                    className={`px-4 py-2 ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
                        : "bg-white hover:bg-gray-50 border-gray-300"
                    } border rounded-lg cursor-pointer transition-colors text-sm`}
                  >
                    {sunshineNightLogo ? sunshineNightLogo.name : "No file chosen"}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className={`${cardBase} rounded-xl p-6 mb-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Header
          </h2>

          {/* Info Box */}
          <div
            className={`mb-6 p-4 rounded-lg ${
              isDarkMode
                ? "bg-blue-900/30 text-blue-200 border border-blue-800"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            <p className="text-sm">
              This system is only supported for the default theme and Wondertag
              theme, for sunshine you can edit the colors through CSS files:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              <li>./themes/sunshine/css/style.css</li>
              <li>./themes/sunshine/layout/style.phtml</li>
            </ul>
          </div>

          <div className="space-y-4">
            {/* Header Background Color */}
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Header Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={headerBgColor}
                  onChange={(e) => setHeaderBgColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={headerBgColor}
                  onChange={(e) => setHeaderBgColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
              </div>
            </div>

            {/* Header Icons/Text color */}
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Header Icons/Text color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={headerIconsTextColor}
                  onChange={(e) => setHeaderIconsTextColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={headerIconsTextColor}
                  onChange={(e) => setHeaderIconsTextColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
              </div>
            </div>

            {/* Header Search Input Background Color */}
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Header Search Input Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={headerSearchBgColor}
                  onChange={(e) => setHeaderSearchBgColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={headerSearchBgColor}
                  onChange={(e) => setHeaderSearchBgColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
              </div>
            </div>

            {/* Header Icons Shadow Color */}
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Header Icons Shadow Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={headerIconsShadowColor}
                  onChange={(e) => setHeaderIconsShadowColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={headerIconsShadowColor}
                  onChange={(e) => setHeaderIconsShadowColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className={`${cardBase} rounded-xl p-6 mb-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Body
          </h2>

          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Body Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bodyBgColor}
                onChange={(e) => setBodyBgColor(e.target.value)}
                className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
              />
              <input
                type="text"
                value={bodyBgColor}
                onChange={(e) => setBodyBgColor(e.target.value)}
                className={`flex-1 px-3 py-2 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className={`${cardBase} rounded-xl p-6 mb-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Buttons
          </h2>

          <div className="space-y-4">
            {/* Text Color */}
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={buttonTextColor}
                  onChange={(e) => setButtonTextColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={buttonTextColor}
                  onChange={(e) => setButtonTextColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={buttonBgColor}
                  onChange={(e) => setButtonBgColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={buttonBgColor}
                  onChange={(e) => setButtonBgColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
              </div>
            </div>

            {/* Hover Text Color */}
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Hover Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={buttonHoverTextColor}
                  onChange={(e) => setButtonHoverTextColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={buttonHoverTextColor}
                  onChange={(e) => setButtonHoverTextColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
              </div>
            </div>

            {/* Hover Background Color */}
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Hover Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={buttonHoverBgColor}
                  onChange={(e) => setButtonHoverBgColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={buttonHoverBgColor}
                  onChange={(e) => setButtonHoverBgColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
              </div>
            </div>

            {/* Disabled Background Color */}
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Disabled Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={buttonDisabledBgColor}
                  onChange={(e) => setButtonDisabledBgColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={buttonDisabledBgColor}
                  onChange={(e) => setButtonDisabledBgColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div
          className={`mb-6 p-4 rounded-lg ${
            isDarkMode
              ? "bg-yellow-900/30 text-yellow-200 border border-yellow-800"
              : "bg-yellow-50 text-yellow-800 border border-yellow-200"
          }`}
        >
          <p className="text-sm">
            Please make sure to clean your browser cache after changing the
            design settings.
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

export default ChangeSiteDesignPage;




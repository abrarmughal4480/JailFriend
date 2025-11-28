"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Camera } from "lucide-react";

const ManageColoredPostsPage = () => {
  const { isDarkMode } = useDarkMode();

  // Colored Posts State
  const [color1, setColor1] = useState("#FFB6C1");
  const [color2, setColor2] = useState("#DDA0DD");
  const [textColor, setTextColor] = useState("#000000");
  const [previewText, setPreviewText] = useState("Hello World !!");

  // Image Posts State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageTextColor, setImageTextColor] = useState("#000000");
  const [imagePreviewText, setImagePreviewText] = useState("Hello World !!");

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateColor = () => {
    // TODO: Implement API call to create colored post
    console.log("Creating colored post:", {
      color1,
      color2,
      textColor,
      previewText,
    });
    alert("Colored post created successfully!");
  };

  const handleCreateImagePost = () => {
    // TODO: Implement API call to create image post
    console.log("Creating image post:", {
      image: selectedImage,
      textColor: imageTextColor,
      previewText: imagePreviewText,
    });
    alert("Image post created successfully!");
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
          Manage Colored Posts
        </h1>
        <div
          className={`text-sm ${textSecondary} flex items-center space-x-2`}
        >
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            🏠
          </span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span>Posts</span>
          <span>&gt;</span>
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            Manage Colored Posts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Add Colored Posts */}
        <div className={`${cardBase} rounded-xl p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Add Colored Posts
          </h2>

          <div className="space-y-4">
            {/* Color 1 */}
            <div>
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Color 1
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="#FFB6C1"
                />
              </div>
            </div>

            {/* Color 2 */}
            <div>
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Color 2
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="#DDA0DD"
                />
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Preview Text Input */}
            <div>
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Preview Text
              </label>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className={`w-full px-3 py-2 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Hello World !!"
              />
            </div>

            {/* Preview Area */}
            <div className="mt-6">
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Preview
              </label>
              <div
                className="w-full h-64 rounded-lg flex items-center justify-center p-4 relative overflow-hidden"
                style={{
                  background: `linear-gradient(to right, ${color1}, ${color2})`,
                }}
              >
                <p
                  className="text-2xl font-bold text-center"
                  style={{ color: textColor }}
                >
                  {previewText || "Hello World !!"}
                </p>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateColor}
              className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Create Color
            </button>
          </div>
        </div>

        {/* Right Card: Add Image Posts */}
        <div className={`${cardBase} rounded-xl p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Add Image Posts
          </h2>

          <div className="space-y-4">
            {/* Image Input */}
            <div>
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex items-center gap-2 px-4 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
                      : "bg-white hover:bg-gray-50 border-gray-300"
                  } border-2 border-dashed rounded-md cursor-pointer transition-colors`}
                >
                  <Camera
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-red-400" : "text-red-500"
                    }`}
                  />
                  <span className={`text-sm ${textSecondary}`}>
                    {selectedImage
                      ? selectedImage.name
                      : "Choose Image File"}
                  </span>
                </label>
              </div>
              {!selectedImage && (
                <p className={`text-xs ${textSecondary} mt-1`}>
                  No file chosen
                </p>
              )}
            </div>

            {/* Text Color */}
            <div>
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={imageTextColor}
                  onChange={(e) => setImageTextColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={imageTextColor}
                  onChange={(e) => setImageTextColor(e.target.value)}
                  className={`flex-1 px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Preview Text Input */}
            <div>
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Preview Text
              </label>
              <input
                type="text"
                value={imagePreviewText}
                onChange={(e) => setImagePreviewText(e.target.value)}
                className={`w-full px-3 py-2 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Hello World !!"
              />
            </div>

            {/* Preview Area */}
            <div className="mt-6">
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Preview
              </label>
              <div
                className={`w-full h-64 rounded-lg flex items-center justify-center p-4 relative overflow-hidden ${
                  isDarkMode ? "bg-gray-700" : "bg-white"
                } border-2 ${
                  isDarkMode ? "border-gray-600" : "border-gray-300"
                }`}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p
                        className="text-2xl font-bold text-center drop-shadow-lg"
                        style={{ color: imageTextColor }}
                      >
                        {imagePreviewText || "Hello World !!"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-2xl font-bold text-center"
                    style={{ color: imageTextColor }}
                  >
                    {imagePreviewText || "Hello World !!"}
                  </p>
                )}
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateImagePost}
              className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Create Color
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageColoredPostsPage;




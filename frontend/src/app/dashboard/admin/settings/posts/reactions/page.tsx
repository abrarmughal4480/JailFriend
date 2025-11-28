"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Paperclip, Edit2, X } from "lucide-react";

interface Reaction {
  id: number;
  name: string;
  icon: string;
  status: "Active" | "Disabled";
}

const PostReactionsPage = () => {
  const { isDarkMode } = useDarkMode();

  // Languages list
  const languages = [
    "Arabic",
    "Bengali",
    "Chinese",
    "Croatian",
    "Danish",
    "Dutch",
    "English",
    "Filipino",
    "French",
    "German",
    "Hebrew",
    "Hindi",
    "Indonesian",
    "Italian",
    "Japanese",
    "Korean",
    "Persian",
    "Portuguese",
    "Russian",
    "Spanish",
    "Swedish",
    "Turkish",
    "Urdu",
    "Vietnamese",
  ];

  // State for new reaction
  const [reactionNames, setReactionNames] = useState<Record<string, string>>(
    {}
  );
  const [reactionIcon, setReactionIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // Sample reactions data
  const [reactions, setReactions] = useState<Reaction[]>([
    {
      id: 1,
      name: "Like",
      icon: "👍",
      status: "Active",
    },
    {
      id: 2,
      name: "Love",
      icon: "❤️",
      status: "Active",
    },
    {
      id: 3,
      name: "HaHa",
      icon: "😂",
      status: "Active",
    },
  ]);

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";
  const tableHeader = isDarkMode
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";
  const tableRow = isDarkMode
    ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
    : "bg-white border-gray-200 hover:bg-gray-50";

  const handleLanguageChange = (language: string, value: string) => {
    setReactionNames((prev) => ({
      ...prev,
      [language]: value,
    }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReactionIcon(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddReaction = () => {
    // TODO: Implement API call to add reaction
    const englishName = reactionNames["English"] || "New Reaction";
    const newReaction: Reaction = {
      id: reactions.length + 1,
      name: englishName,
      icon: iconPreview || "😊",
      status: "Active",
    };
    setReactions([...reactions, newReaction]);
    
    // Reset form
    setReactionNames({});
    setReactionIcon(null);
    setIconPreview(null);
    
    alert("Reaction added successfully!");
  };

  const handleEdit = (id: number) => {
    // TODO: Implement edit functionality
    alert(`Edit reaction ${id}`);
  };

  const handleDisable = (id: number) => {
    setReactions(
      reactions.map((reaction) =>
        reaction.id === id
          ? {
              ...reaction,
              status: reaction.status === "Active" ? "Disabled" : "Active",
            }
          : reaction
      )
    );
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
          Manage Reactions
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
            Manage Reactions
          </span>
        </div>
      </div>

      {/* Add New Reaction Section */}
      <div className={`${cardBase} rounded-xl p-6 mb-6`}>
        <h2 className={`text-2xl font-semibold ${textPrimary} mb-4`}>
          Add New Reaction
        </h2>

        {/* Info Banner */}
        <div
          className={`mb-6 p-4 rounded-lg ${
            isDarkMode
              ? "bg-blue-900/30 text-blue-200 border border-blue-800"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          <p className="text-sm">
            You can add new reactions from here, note you should write the
            reaction name on every language.
          </p>
        </div>

        {/* Language Input Fields */}
        <div className="mb-6">
          <h3
            className={`text-lg font-medium ${textPrimary} mb-4`}
          >
            Reaction Names (All Languages)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {languages.map((language) => (
              <div key={language}>
                <label
                  className={`block text-sm font-medium ${textPrimary} mb-2`}
                >
                  {language}
                </label>
                <input
                  type="text"
                  value={reactionNames[language] || ""}
                  onChange={(e) => handleLanguageChange(language, e.target.value)}
                  className={`w-full px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                  placeholder={`Enter ${language} name`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Reaction Icon Input */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label
              className={`block text-sm font-medium ${textPrimary} mb-2`}
            >
              Reaction Icon
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="hidden"
                id="icon-upload"
              />
              <label
                htmlFor="icon-upload"
                className={`flex items-center gap-2 px-4 py-2 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
                    : "bg-white hover:bg-gray-50 border-gray-300"
                } border-2 border-dashed rounded-md cursor-pointer transition-colors`}
              >
                <Paperclip
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-blue-400" : "text-blue-500"
                  }`}
                />
                <span className={`text-sm ${textSecondary}`}>
                  {reactionIcon ? reactionIcon.name : "Choose Icon File"}
                </span>
              </label>
            </div>
            {iconPreview && (
              <div className="mt-2">
                <img
                  src={iconPreview}
                  alt="Icon preview"
                  className="w-12 h-12 object-contain"
                />
              </div>
            )}
          </div>

          {/* Add Reaction Button */}
          <button
            onClick={handleAddReaction}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 whitespace-nowrap"
          >
            Add Reaction
          </button>
        </div>
      </div>

      {/* Manage Reaction Section */}
      <div className={`${cardBase} rounded-xl p-6`}>
        <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
          Manage Reaction
        </h2>

        {/* Reactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={tableHeader}>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  NAME
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  ICON
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {reactions.map((reaction) => (
                <tr
                  key={reaction.id}
                  className={`${tableRow} border-b transition-colors`}
                >
                  <td className={`px-4 py-3 ${textPrimary} text-sm`}>
                    {reaction.id}
                  </td>
                  <td className={`px-4 py-3 ${textPrimary} text-sm font-medium`}>
                    {reaction.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-2xl">{reaction.icon}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        reaction.status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {reaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(reaction.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors duration-200 flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDisable(reaction.id)}
                        className={`${
                          reaction.status === "Active"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-gray-500 hover:bg-gray-600"
                        } text-white px-3 py-1 rounded text-sm font-semibold transition-colors duration-200 flex items-center gap-1`}
                      >
                        <X className="w-4 h-4" />
                        {reaction.status === "Active" ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PostReactionsPage;




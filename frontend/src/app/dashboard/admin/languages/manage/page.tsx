"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Language {
  id: number;
  name: string;
  selected: boolean;
}

const ManageLanguages = () => {
  const { isDarkMode } = useDarkMode();
  const [languages, setLanguages] = useState<Language[]>([
    { id: 1, name: 'Arabic', selected: false },
    { id: 2, name: 'Bengali', selected: false },
    { id: 3, name: 'Chinese', selected: false },
    { id: 4, name: 'Croatian', selected: false },
    { id: 5, name: 'Danish', selected: false },
    { id: 6, name: 'Dutch', selected: false },
    { id: 7, name: 'English', selected: false },
    { id: 8, name: 'Filipino', selected: false },
    { id: 9, name: 'French', selected: false },
    { id: 10, name: 'Hebrew', selected: false },
    { id: 11, name: 'Hindi', selected: false },
    { id: 12, name: 'Indonesian', selected: false },
    { id: 13, name: 'Italian', selected: false },
    { id: 14, name: 'Japanese', selected: false },
    { id: 15, name: 'Korean', selected: false },
    { id: 16, name: 'Persian', selected: false },
    { id: 17, name: 'Portuguese', selected: false },
    { id: 18, name: 'Russian', selected: false },
    { id: 19, name: 'Spanish', selected: false },
    { id: 20, name: 'Swedish', selected: false },
    { id: 21, name: 'Turkish', selected: false },
    { id: 22, name: 'Urdu', selected: false },
    { id: 23, name: 'Vietnamese', selected: false }
  ]);

  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);

  const handleCheckboxChange = (languageId: number): void => {
    setLanguages(languages.map(lang => 
      lang.id === languageId ? { ...lang, selected: !lang.selected } : lang
    ));

    if (selectedLanguages.includes(languageId)) {
      setSelectedLanguages(selectedLanguages.filter(id => id !== languageId));
    } else {
      setSelectedLanguages([...selectedLanguages, languageId]);
    }
  };

  const handleEdit = (languageName: string): void => {
    console.log(`Edit ${languageName}`);
  };

  const handleDelete = (languageName: string): void => {
    console.log(`Delete ${languageName}`);
  };

  const handleDisable = (languageName: string): void => {
    console.log(`Disable ${languageName}`);
  };

  const handleDeleteSelected = (): void => {
    console.log('Delete selected languages:', selectedLanguages);
    setLanguages(languages.filter(lang => !selectedLanguages.includes(lang.id)));
    setSelectedLanguages([]);
  };

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";
  const textTertiary = isDarkMode ? "text-gray-400" : "text-gray-500";
  const tableHeader = isDarkMode
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";
  const tableRow = isDarkMode
    ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
    : "bg-white border-gray-200 hover:bg-gray-50";

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className={`flex items-center space-x-2 text-sm mb-6 ${textSecondary}`}>
          <Link href="/" className={`${isDarkMode ? "text-blue-400" : "text-blue-600"} hover:underline flex items-center`}>
            <span className="mr-1">🏠</span>
            Home
          </Link>
          <span className={textTertiary}>›</span>
          <Link href="/languages" className={`${isDarkMode ? "text-blue-400" : "text-blue-600"} hover:underline`}>
            Languages
          </Link>
          <span className={textTertiary}>›</span>
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>Manage Languages</span>
        </nav>

        {/* Main Content */}
        <div className={`${cardBase} rounded-xl`}>
          {/* Header */}
          <div className={`p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <h1 className={`text-xl font-semibold ${textPrimary} mb-4`}>
              Manage & Edit Languages
            </h1>
            <div className={`${isDarkMode ? "bg-blue-900/30 border-blue-800" : "bg-blue-100 border-blue-200"} border rounded-md p-3`}>
              <p className={`${isDarkMode ? "text-blue-300" : "text-blue-800"} text-sm`}>
                You can manage, edit and delete languages.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${tableHeader} border-b ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"} text-sm`}>
                    <input
                      type="checkbox"
                      className={`rounded ${isDarkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"}`}
                    />
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"} text-sm uppercase tracking-wider`}>
                    Language Name
                  </th>
                  <th className={`text-center py-3 px-4 font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"} text-sm uppercase tracking-wider`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-gray-600" : "divide-gray-200"}`}>
                {languages.map((language) => (
                  <tr key={language.id} className={`${tableRow} transition-colors`}>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={language.selected}
                        onChange={() => handleCheckboxChange(language.id)}
                        className={`rounded ${isDarkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"}`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`${isDarkMode ? "text-blue-400" : "text-blue-600"} font-medium`}>
                        {language.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(language.name)}
                          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(language.name)}
                          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleDisable(language.name)}
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
                        >
                          Disable
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete Selected Button */}
          <div className={`p-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedLanguages.length === 0}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                selectedLanguages.length === 0
                  ? `${textTertiary} ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"} border cursor-not-allowed`
                  : `text-white ${isDarkMode ? "bg-blue-600 border-blue-600 hover:bg-blue-700" : "bg-blue-500 border-blue-500 hover:bg-blue-600"} border`
              }`}
            >
              Delete Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLanguages;

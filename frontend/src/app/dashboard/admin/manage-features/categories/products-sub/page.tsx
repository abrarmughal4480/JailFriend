'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Category {
  _id: string;
  name?: string;
  title?: string;
  categoryName?: string;
  english?: string;
  [key: string]: any;
}

interface SubCategory {
  _id: string;
  categoryId?: string;
  category?: Category;
  name?: string;
  title?: string;
  categoryName?: string;
  english?: string;
  [key: string]: any;
}

const languages = [
  { key: 'arabic', label: 'Arabic' },
  { key: 'bengali', label: 'Bengali' },
  { key: 'chinese', label: 'Chinese' },
  { key: 'croatian', label: 'Croatian' },
  { key: 'danish', label: 'Danish' },
  { key: 'dutch', label: 'Dutch' },
  { key: 'english', label: 'English' },
  { key: 'filipino', label: 'Filipino' },
  { key: 'french', label: 'French' },
  { key: 'german', label: 'German' },
  { key: 'hebrew', label: 'Hebrew' },
  { key: 'hindi', label: 'Hindi' },
  { key: 'indonesian', label: 'Indonesian' },
  { key: 'italian', label: 'Italian' },
  { key: 'japanese', label: 'Japanese' },
  { key: 'korean', label: 'Korean' },
  { key: 'persian', label: 'Persian' },
  { key: 'portuguese', label: 'Portuguese' },
  { key: 'russian', label: 'Russian' },
  { key: 'spanish', label: 'Spanish' },
  { key: 'swedish', label: 'Swedish' },
  { key: 'turkish', label: 'Turkish' },
  { key: 'urdu', label: 'Urdu' },
  { key: 'vietnamese', label: 'Vietnamese' }
];

const ProductsSubCategories = () => {
  const { isDarkMode } = useDarkMode();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [languageInputs, setLanguageInputs] = useState<Record<string, string>>({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  useEffect(() => {
    if (editingSubCategory) {
      // Initialize language inputs with existing subcategory data
      const inputs: Record<string, string> = {};
      languages.forEach(lang => {
        inputs[lang.key] = (editingSubCategory as any)[lang.key] || '';
      });
      setLanguageInputs(inputs);
      setSelectedCategory(editingSubCategory.categoryId || '');
    } else {
      // Reset language inputs
      setLanguageInputs({});
    }
  }, [editingSubCategory]);

  useEffect(() => {
    // Filter subcategories when filter category changes
    if (filterCategory) {
      const filtered = subCategories.filter(sub => sub.categoryId === filterCategory);
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories(subCategories);
    }
  }, [filterCategory, subCategories]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/categories/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const categoriesList = Array.isArray(data) ? data : (data.categories || []);
        setCategories(categoriesList);
        // Set default selected category if available
        if (categoriesList.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesList[0]._id);
          setFilterCategory(categoriesList[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try different possible API endpoints
      let response = await fetch(`${API_URL}/api/categories/products-sub`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If that fails, try alternative endpoint
      if (!response.ok) {
        response = await fetch(`${API_URL}/api/categories/products/subcategories`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.ok) {
        const data = await response.json();
        const subCategoriesList = Array.isArray(data) ? data : (data.subCategories || data.categories || []);
        setSubCategories(subCategoriesList);
        setFilteredSubCategories(subCategoriesList);
      } else {
        setSubCategories([]);
        setFilteredSubCategories([]);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubCategories([]);
      setFilteredSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageInputChange = (key: string, value: string) => {
    setLanguageInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCategory) {
      setError('Please select a main category');
      return;
    }

    // Check if at least one language input is filled
    const hasValue = Object.values(languageInputs).some(val => val.trim() !== '');
    if (!hasValue) {
      setError('Please enter at least one sub-category name');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      const subCategoryData: any = {
        ...languageInputs,
        categoryId: selectedCategory,
        type: 'product-sub'
      };

      // Try different possible API endpoints
      let response = await fetch(`${API_URL}/api/categories/products-sub`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subCategoryData)
      });

      // If that fails, try alternative endpoint
      if (!response.ok) {
        response = await fetch(`${API_URL}/api/categories/products/subcategories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subCategoryData)
        });
      }

      if (response.ok) {
        alert('Sub-category created successfully!');
        setLanguageInputs({});
        await fetchSubCategories();
      } else {
        const data = await response.json();
        setError(data.error || data.message || 'Failed to create sub-category');
      }
    } catch (error) {
      console.error('Error creating sub-category:', error);
      setError('Failed to create sub-category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubCategory) return;

    setError('');

    if (!selectedCategory) {
      setError('Please select a main category');
      return;
    }

    // Check if at least one language input is filled
    const hasValue = Object.values(languageInputs).some(val => val.trim() !== '');
    if (!hasValue) {
      setError('Please enter at least one sub-category name');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      const subCategoryData: any = {
        ...languageInputs,
        categoryId: selectedCategory
      };

      // Try different possible API endpoints
      let response = await fetch(`${API_URL}/api/categories/products-sub/${editingSubCategory._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subCategoryData)
      });

      // If that fails, try alternative endpoint
      if (!response.ok) {
        response = await fetch(`${API_URL}/api/categories/products/subcategories/${editingSubCategory._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subCategoryData)
        });
      }

      if (response.ok) {
        alert('Sub-category updated successfully!');
        setEditingSubCategory(null);
        setLanguageInputs({});
        await fetchSubCategories();
      } else {
        const data = await response.json();
        setError(data.error || data.message || 'Failed to update sub-category');
      }
    } catch (error) {
      console.error('Error updating sub-category:', error);
      setError('Failed to update sub-category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setSelectedCategory(subCategory.categoryId || '');
    // Scroll to top to show the edit form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    if (!confirm('Are you sure you want to delete this sub-category?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Try different possible API endpoints
      let response = await fetch(`${API_URL}/api/categories/products-sub/${subCategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If that fails, try alternative endpoint
      if (!response.ok) {
        response = await fetch(`${API_URL}/api/categories/products/subcategories/${subCategoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.ok) {
        alert('Sub-category deleted successfully!');
        await fetchSubCategories();
      } else {
        alert('Failed to delete sub-category');
      }
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      alert('Failed to delete sub-category');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one sub-category to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} sub-category(ies)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const deletePromises = Array.from(selectedIds).map(id => {
        // Try different possible API endpoints
        let response = fetch(`${API_URL}/api/categories/products-sub/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // If that fails, try alternative endpoint
        return response.catch(() => 
          fetch(`${API_URL}/api/categories/products/subcategories/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        );
      });

      await Promise.all(deletePromises);
      alert('Selected sub-categories deleted successfully!');
      setSelectedIds(new Set());
      await fetchSubCategories();
    } catch (error) {
      console.error('Error deleting sub-categories:', error);
      alert('Failed to delete some sub-categories');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredSubCategories.map(sub => sub._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleShowSubCategories = () => {
    // Filter is already handled by useEffect, this is just for the button action
    // The filter is applied automatically when filterCategory changes
  };

  const getCategoryName = (category: Category) => {
    if (category.name) return category.name;
    if (category.title) return category.title;
    if (category.categoryName) return category.categoryName;
    if (category.english) return category.english;
    return 'Untitled Category';
  };

  const getSubCategoryName = (subCategory: SubCategory) => {
    if (subCategory.name) return subCategory.name;
    if (subCategory.title) return subCategory.title;
    if (subCategory.categoryName) return subCategory.categoryName;
    if (subCategory.english) return subCategory.english;
    return 'Untitled Sub-Category';
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat._id === categoryId);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-4`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Home
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Manage Features
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Category
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-medium`}>Manage Products Sub Categories</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
          Manage Products Sub Categories
        </h1>

        {/* Add Sub Category Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6 mb-6`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            {editingSubCategory ? 'Edit Sub Category' : 'Add Sub Category'}
          </h2>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={editingSubCategory ? handleUpdateSubCategory : handleAddSubCategory}>
            {/* Main Category Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Main Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {getCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Inputs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {languages.map((lang) => (
                <div key={lang.key}>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {lang.label}
                  </label>
                  <input
                    type="text"
                    value={languageInputs[lang.key] || ''}
                    onChange={(e) => handleLanguageInputChange(lang.key, e.target.value)}
                    className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                    placeholder={`${lang.label} name`}
                  />
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              {editingSubCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubCategory(null);
                    setLanguageInputs({});
                    setSelectedCategory('');
                    setError('');
                  }}
                  className={`px-4 py-2 mr-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} rounded-md transition-colors`}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${submitting ? 'opacity-50' : ''}`}
              >
                {submitting ? (editingSubCategory ? 'Updating...' : 'Adding...') : (editingSubCategory ? 'Update' : 'Add')}
              </button>
            </div>
          </form>
        </div>

        {/* Manage Sub Categories Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Manage Sub Categories
          </h2>

          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {getCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleShowSubCategories}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors`}
              >
                Show
              </button>
            </div>
          </div>

          {/* Sub Categories Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={filteredSubCategories.length > 0 && selectedIds.size === filteredSubCategories.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                    />
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    ID
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    CATEGORY NAME
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className={`ml-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading sub-categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSubCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No sub-categories found
                    </td>
                  </tr>
                ) : (
                  filteredSubCategories.map((subCategory) => {
                    const category = getCategoryById(subCategory.categoryId || '');
                    return (
                      <tr key={subCategory._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(subCategory._id)}
                            onChange={(e) => handleSelectOne(subCategory._id, e.target.checked)}
                            className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                          />
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {subCategory._id.substring(subCategory._id.length - 8)}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {getSubCategoryName(subCategory)}
                          {category && (
                            <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ({getCategoryName(category)})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditSubCategory(subCategory)}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubCategory(subCategory._id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Delete Selected Button */}
          {selectedIds.size > 0 && (
            <div className="flex justify-start">
              <button
                onClick={handleDeleteSelected}
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors`}
              >
                Delete Selected ({selectedIds.size})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsSubCategories;

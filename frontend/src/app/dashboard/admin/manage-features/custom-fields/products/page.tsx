'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface CustomField {
  _id: string;
  fieldName?: string;
  name?: string;
  type?: string;
  length?: number;
  placement?: string;
  [key: string]: any;
}

const CustomProductsFields = () => {
  const { isDarkMode } = useDarkMode();
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try different possible API endpoints
      let response = await fetch(`${API_URL}/api/custom-fields/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If that fails, try alternative endpoint
      if (!response.ok) {
        response = await fetch(`${API_URL}/api/admin/custom-fields/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.ok) {
        const data = await response.json();
        const fieldsList = Array.isArray(data) ? data : (data.fields || data.customFields || []);
        setFields(fieldsList);
      } else {
        setFields([]);
      }
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedFields = () => {
    if (!sortConfig) return fields;

    return [...fields].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      // Handle different field types
      if (sortConfig.key === 'fieldName' || sortConfig.key === 'name') {
        aValue = (a.fieldName || a.name || '').toLowerCase();
        bValue = (b.fieldName || b.name || '').toLowerCase();
      } else if (sortConfig.key === 'length') {
        aValue = a.length || 0;
        bValue = b.length || 0;
      } else {
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(fields.map(field => field._id)));
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

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one field to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} field(s)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const deletePromises = Array.from(selectedIds).map(id => {
        // Try different possible API endpoints
        let response = fetch(`${API_URL}/api/custom-fields/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // If that fails, try alternative endpoint
        return response.catch(() => 
          fetch(`${API_URL}/api/admin/custom-fields/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        );
      });

      await Promise.all(deletePromises);
      alert('Selected fields deleted successfully!');
      setSelectedIds(new Set());
      await fetchFields();
    } catch (error) {
      console.error('Error deleting fields:', error);
      alert('Failed to delete some fields');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Try different possible API endpoints
      let response = await fetch(`${API_URL}/api/custom-fields/products/${fieldId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If that fails, try alternative endpoint
      if (!response.ok) {
        response = await fetch(`${API_URL}/api/admin/custom-fields/products/${fieldId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.ok) {
        alert('Field deleted successfully!');
        await fetchFields();
      } else {
        alert('Failed to delete field');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Failed to delete field');
    }
  };

  const handleEditField = (field: CustomField) => {
    // TODO: Implement edit functionality - could open a modal or navigate to edit page
    alert('Edit functionality to be implemented');
  };

  const handleCreateNew = () => {
    // TODO: Implement create functionality - could open a modal or navigate to create page
    alert('Create new field functionality to be implemented');
  };

  const getFieldName = (field: CustomField) => {
    return field.fieldName || field.name || 'Untitled Field';
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const sortedFields = getSortedFields();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-4`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </li>
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
                Custom Fields
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-medium`}>Products Fields</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
          Products Fields
        </h1>

        {/* Main Content Area */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
          {/* Sub-heading and Create Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Products Fields
            </h2>
            <button
              onClick={handleCreateNew}
              className={`px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md transition-colors font-medium`}
            >
              Create New Custom Field
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={fields.length > 0 && selectedIds.size === fields.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                    />
                  </th>
                  <th 
                    className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''} transition-colors`}
                    onClick={() => handleSort('_id')}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      {getSortIcon('_id') && (
                        <span className="text-xs">{getSortIcon('_id')}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''} transition-colors`}
                    onClick={() => handleSort('fieldName')}
                  >
                    <div className="flex items-center gap-1">
                      FIELD NAME
                      {getSortIcon('fieldName') && (
                        <span className="text-xs">{getSortIcon('fieldName')}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''} transition-colors`}
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      TYPE
                      {getSortIcon('type') && (
                        <span className="text-xs">{getSortIcon('type')}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''} transition-colors`}
                    onClick={() => handleSort('length')}
                  >
                    <div className="flex items-center gap-1">
                      LENGTH
                      {getSortIcon('length') && (
                        <span className="text-xs">{getSortIcon('length')}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''} transition-colors`}
                    onClick={() => handleSort('placement')}
                  >
                    <div className="flex items-center gap-1">
                      PLACEMENT
                      {getSortIcon('placement') && (
                        <span className="text-xs">{getSortIcon('placement')}</span>
                      )}
                    </div>
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className={`ml-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading fields...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedFields.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No custom fields found
                    </td>
                  </tr>
                ) : (
                  sortedFields.map((field) => (
                    <tr key={field._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(field._id)}
                          onChange={(e) => handleSelectOne(field._id, e.target.checked)}
                          className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                        />
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {field._id.substring(field._id.length - 8)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {getFieldName(field)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {field.type || 'N/A'}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {field.length || 'N/A'}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {field.placement || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditField(field)}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteField(field._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Delete Selected Button */}
          {selectedIds.size > 0 && (
            <div className="flex justify-start mt-4">
              <button
                onClick={handleDeleteSelected}
                className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors`}
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

export default CustomProductsFields;

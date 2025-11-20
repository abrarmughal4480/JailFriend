"use client";

import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/utils/adminApi';

interface CategoryFormState {
  title: string;
  description: string;
  image: string;
  isActive: boolean;
}

interface P2PCategory {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  image?: string;
  slug?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const emptyForm: CategoryFormState = {
  title: '',
  description: '',
  image: '',
  isActive: true
};

const getCategoryId = (category: P2PCategory) => category._id || category.id || '';

export default function P2PCategoriesPage() {
  const [categories, setCategories] = useState<P2PCategory[]>([]);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditing = Boolean(editingId);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getP2PCategories();
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Category title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (isEditing && editingId) {
        await adminApi.updateP2PCategory(editingId, form);
        setSuccessMessage('Category updated successfully');
      } else {
        await adminApi.createP2PCategory(form);
        setSuccessMessage('Category created successfully');
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: P2PCategory) => {
    setForm({
      title: category.title || '',
      description: category.description || '',
      image: category.image || '',
      isActive: category.isActive !== false
    });
    setEditingId(getCategoryId(category));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (category: P2PCategory) => {
    const id = getCategoryId(category);
    if (!id) return;
    const confirmed = window.confirm(`Delete "${category.title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setSubmitting(true);
      await adminApi.deleteP2PCategory(id);
      if (editingId === id) {
        resetForm();
      }
      setSuccessMessage('Category deleted successfully');
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (isActive?: boolean) => (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => (a.title || '').localeCompare(b.title || '')),
    [categories]
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">P2P Categories</h1>
        <p className="text-gray-600">
          Create categories to help users classify their P2P profiles.
        </p>
      </div>

      {(error || successMessage) && (
        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Update Category' : 'Create Category'}
          </h2>
          {isEditing && (
            <button
              onClick={resetForm}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Cancel Editing
            </button>
          )}
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Design & Creative"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Short description that helps users understand this category"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/category.png"
            />
            {form.image && (
              <div className="mt-3 inline-flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <img
                  src={form.image}
                  alt="Category preview"
                  className="w-16 h-16 object-cover rounded-md border border-gray-100"
                  onError={(event) => {
                    (event.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-sm text-gray-500">Preview</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Inactive</span>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.isActive ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-500">Active</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Existing Categories</h2>
          <span className="text-sm text-gray-500">
            {categories.length} total
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading categories...</div>
        ) : sortedCategories.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No categories yet. Create the first one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedCategories.map((category) => (
                  <tr key={getCategoryId(category)}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.title}
                            className="w-12 h-12 object-cover rounded-md border border-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-semibold uppercase">
                            {category.title?.slice(0, 2) || 'NA'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{category.title}</p>
                          {category.slug && (
                            <p className="text-xs text-gray-500">/{category.slug}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {category.description || '—'}
                    </td>
                    <td className="px-4 py-4">
                      {statusBadge(category.isActive !== false)}
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                        disabled={submitting}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                        disabled={submitting}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}









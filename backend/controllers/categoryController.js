const Category = require('../models/category');
const SubCategory = require('../models/subCategory');

const normalizeString = (value) =>
  typeof value === 'string' ? value.trim() : value;

const handleError = (res, error, fallbackMessage) => {
  console.error('Category controller error:', error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A category with the same value already exists'
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    error: error.message
  });
};

// ======= MAIN CATEGORIES =======

const listCategoriesByType = (type) => async (req, res) => {
  try {
    const categories = await Category.find({ type }).sort({ createdAt: -1 }).lean();

    // Frontend accepts either array or { categories: [] }
    return res.json({ success: true, categories });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch categories');
  }
};

const createCategoryByType = (type) => async (req, res) => {
  try {
    const data = { ...req.body };

    // Always enforce type from route to avoid inconsistencies
    data.type = type;

    // Normalize string fields a bit
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'string') {
        data[key] = normalizeString(data[key]);
      }
    });

    const category = await Category.create(data);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    return handleError(res, error, 'Failed to create category');
  }
};

const updateCategoryByType = (type) => async (req, res) => {
  try {
    const { categoryId } = req.params;

    const existing = await Category.findOne({ _id: categoryId, type });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updates = { ...req.body };
    delete updates.type; // do not allow type changes

    Object.keys(updates).forEach((key) => {
      if (typeof updates[key] === 'string') {
        updates[key] = normalizeString(updates[key]);
      }
    });

    Object.assign(existing, updates);
    await existing.save();

    return res.json({
      success: true,
      message: 'Category updated successfully',
      category: existing
    });
  } catch (error) {
    return handleError(res, error, 'Failed to update category');
  }
};

const deleteCategoryByType = (type) => async (req, res) => {
  try {
    const { categoryId } = req.params;

    const deleted = await Category.findOneAndDelete({ _id: categoryId, type });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    return handleError(res, error, 'Failed to delete category');
  }
};

// ======= SUB-CATEGORIES =======

const listSubCategoriesByType = (type) => async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ type })
      .sort({ createdAt: -1 })
      .lean();

    // Frontend checks: data.subCategories || data.categories || data (array)
    return res.json({ success: true, subCategories });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch sub-categories');
  }
};

const createSubCategoryByType = (type) => async (req, res) => {
  try {
    const data = { ...req.body };

    // Ensure categoryId is provided
    if (!data.categoryId) {
      return res.status(400).json({
        success: false,
        message: 'categoryId is required'
      });
    }

    data.type = type;

    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'string') {
        data[key] = normalizeString(data[key]);
      }
    });

    const subCategory = await SubCategory.create(data);

    return res.status(201).json({
      success: true,
      message: 'Sub-category created successfully',
      subCategory
    });
  } catch (error) {
    return handleError(res, error, 'Failed to create sub-category');
  }
};

const updateSubCategoryByType = (type) => async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    const existing = await SubCategory.findOne({ _id: subCategoryId, type });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Sub-category not found'
      });
    }

    const updates = { ...req.body };
    delete updates.type;

    Object.keys(updates).forEach((key) => {
      if (typeof updates[key] === 'string') {
        updates[key] = normalizeString(updates[key]);
      }
    });

    Object.assign(existing, updates);
    await existing.save();

    return res.json({
      success: true,
      message: 'Sub-category updated successfully',
      subCategory: existing
    });
  } catch (error) {
    return handleError(res, error, 'Failed to update sub-category');
  }
};

const deleteSubCategoryByType = (type) => async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    const deleted = await SubCategory.findOneAndDelete({ _id: subCategoryId, type });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Sub-category not found'
      });
    }

    return res.json({
      success: true,
      message: 'Sub-category deleted successfully'
    });
  } catch (error) {
    return handleError(res, error, 'Failed to delete sub-category');
  }
};

module.exports = {
  // Main categories
  listCategoriesByType,
  createCategoryByType,
  updateCategoryByType,
  deleteCategoryByType,

  // Sub-categories
  listSubCategoriesByType,
  createSubCategoryByType,
  updateSubCategoryByType,
  deleteSubCategoryByType
};



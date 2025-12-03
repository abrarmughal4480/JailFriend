const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  listCategoriesByType,
  createCategoryByType,
  updateCategoryByType,
  deleteCategoryByType,
  listSubCategoriesByType,
  createSubCategoryByType,
  updateSubCategoryByType,
  deleteSubCategoryByType
} = require('../controllers/categoryController');

// Helper to bind handlers with a fixed type
const bind = (fn, type) => fn(type);

// ===== MAIN CATEGORIES =====

// Blogs
router.get('/blogs', authMiddleware, bind(listCategoriesByType, 'blog'));
router.post('/blogs', authMiddleware, bind(createCategoryByType, 'blog'));
router.put('/blogs/:categoryId', authMiddleware, bind(updateCategoryByType, 'blog'));
router.delete('/blogs/:categoryId', authMiddleware, bind(deleteCategoryByType, 'blog'));

// Products
router.get('/products', authMiddleware, bind(listCategoriesByType, 'product'));
router.post('/products', authMiddleware, bind(createCategoryByType, 'product'));
router.put('/products/:categoryId', authMiddleware, bind(updateCategoryByType, 'product'));
router.delete('/products/:categoryId', authMiddleware, bind(deleteCategoryByType, 'product'));

// Jobs
router.get('/jobs', authMiddleware, bind(listCategoriesByType, 'job'));
router.post('/jobs', authMiddleware, bind(createCategoryByType, 'job'));
router.put('/jobs/:categoryId', authMiddleware, bind(updateCategoryByType, 'job'));
router.delete('/jobs/:categoryId', authMiddleware, bind(deleteCategoryByType, 'job'));

// Groups
router.get('/groups', authMiddleware, bind(listCategoriesByType, 'group'));
router.post('/groups', authMiddleware, bind(createCategoryByType, 'group'));
router.put('/groups/:categoryId', authMiddleware, bind(updateCategoryByType, 'group'));
router.delete('/groups/:categoryId', authMiddleware, bind(deleteCategoryByType, 'group'));

// Pages
router.get('/pages', authMiddleware, bind(listCategoriesByType, 'page'));
router.post('/pages', authMiddleware, bind(createCategoryByType, 'page'));
router.put('/pages/:categoryId', authMiddleware, bind(updateCategoryByType, 'page'));
router.delete('/pages/:categoryId', authMiddleware, bind(deleteCategoryByType, 'page'));

// ===== SUB-CATEGORIES =====

// Products sub-categories (both /products-sub and /products/subcategories)
router.get('/products-sub', authMiddleware, bind(listSubCategoriesByType, 'product-sub'));
router.post('/products-sub', authMiddleware, bind(createSubCategoryByType, 'product-sub'));
router.put('/products-sub/:subCategoryId', authMiddleware, bind(updateSubCategoryByType, 'product-sub'));
router.delete('/products-sub/:subCategoryId', authMiddleware, bind(deleteSubCategoryByType, 'product-sub'));

router.get('/products/subcategories', authMiddleware, bind(listSubCategoriesByType, 'product-sub'));
router.post('/products/subcategories', authMiddleware, bind(createSubCategoryByType, 'product-sub'));
router.put('/products/subcategories/:subCategoryId', authMiddleware, bind(updateSubCategoryByType, 'product-sub'));
router.delete('/products/subcategories/:subCategoryId', authMiddleware, bind(deleteSubCategoryByType, 'product-sub'));

// Pages sub-categories
router.get('/pages-sub', authMiddleware, bind(listSubCategoriesByType, 'page-sub'));
router.post('/pages-sub', authMiddleware, bind(createSubCategoryByType, 'page-sub'));
router.put('/pages-sub/:subCategoryId', authMiddleware, bind(updateSubCategoryByType, 'page-sub'));
router.delete('/pages-sub/:subCategoryId', authMiddleware, bind(deleteSubCategoryByType, 'page-sub'));

router.get('/pages/subcategories', authMiddleware, bind(listSubCategoriesByType, 'page-sub'));
router.post('/pages/subcategories', authMiddleware, bind(createSubCategoryByType, 'page-sub'));
router.put('/pages/subcategories/:subCategoryId', authMiddleware, bind(updateSubCategoryByType, 'page-sub'));
router.delete('/pages/subcategories/:subCategoryId', authMiddleware, bind(deleteSubCategoryByType, 'page-sub'));

// Groups sub-categories
router.get('/groups-sub', authMiddleware, bind(listSubCategoriesByType, 'group-sub'));
router.post('/groups-sub', authMiddleware, bind(createSubCategoryByType, 'group-sub'));
router.put('/groups-sub/:subCategoryId', authMiddleware, bind(updateSubCategoryByType, 'group-sub'));
router.delete('/groups-sub/:subCategoryId', authMiddleware, bind(deleteSubCategoryByType, 'group-sub'));

router.get('/groups/subcategories', authMiddleware, bind(listSubCategoriesByType, 'group-sub'));
router.post('/groups/subcategories', authMiddleware, bind(createSubCategoryByType, 'group-sub'));
router.put('/groups/subcategories/:subCategoryId', authMiddleware, bind(updateSubCategoryByType, 'group-sub'));
router.delete('/groups/subcategories/:subCategoryId', authMiddleware, bind(deleteSubCategoryByType, 'group-sub'));

module.exports = router;




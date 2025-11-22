const P2PCategory = require('../models/p2pCategory');

const normalizeString = (value) =>
  typeof value === 'string' ? value.trim() : value;

const handleControllerError = (res, error, fallbackMessage) => {
  console.error('P2P Category controller error:', error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A category with the same title or slug already exists'
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    error: error.message
  });
};

const formatCategoryResponse = (category) => ({
  ...category.toObject(),
  id: category._id
});

const createCategory = async (req, res) => {
  try {
    const { title, description, imageUrl, isActive = true } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category title is required'
      });
    }

    // Handle image upload (file or URL)
    let imageUrlFinal = '';
    
    if (req.file) {
      // File was uploaded via multer/cloudinary
      console.log('📸 Image uploaded successfully:', req.file.path);
      
      // Check if Cloudinary is configured
      const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                    process.env.CLOUDINARY_API_KEY && 
                                    process.env.CLOUDINARY_API_SECRET &&
                                    process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
                                    process.env.CLOUDINARY_API_KEY !== 'your-api-key' &&
                                    process.env.CLOUDINARY_API_SECRET !== 'your-api-secret';
      
      if (isCloudinaryConfigured) {
        // Use Cloudinary URL (already a full HTTPS URL)
        imageUrlFinal = req.file.path;
        console.log('☁️ Cloudinary image URL:', imageUrlFinal);
      } else {
        // For local storage, construct a relative URL
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://jaifriend-backend.hgdjlive.com'
          : 'http://localhost:3001';
        const relativePath = req.file.path.replace(/\\/g, '/');
        const finalRelativePath = relativePath.startsWith('uploads/') ? relativePath : `uploads/${relativePath}`;
        imageUrlFinal = `${baseUrl}/${finalRelativePath}`;
        console.log('📁 Local image URL:', imageUrlFinal);
      }
    } else if (imageUrl) {
      // Fallback to URL if provided
      imageUrlFinal = normalizeString(imageUrl);
    }

    const category = await P2PCategory.create({
      title: normalizeString(title),
      description: normalizeString(description) || '',
      image: imageUrlFinal,
      isActive: Boolean(isActive)
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: formatCategoryResponse(category)
    });
  } catch (error) {
    return handleControllerError(res, error, 'Failed to create category');
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await P2PCategory.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    return handleControllerError(res, error, 'Failed to fetch categories');
  }
};

const getPublicCategories = async (req, res) => {
  try {
    const categories = await P2PCategory.find({ isActive: true })
      .sort({ title: 1 })
      .lean();

    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    return handleControllerError(res, error, 'Failed to fetch categories');
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { title, description, imageUrl, isActive } = req.body;

    const category = await P2PCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (title !== undefined) category.title = normalizeString(title);
    if (description !== undefined) category.description = normalizeString(description) || '';
    
    // Handle image update (file or URL)
    if (req.file) {
      // File was uploaded via multer/cloudinary
      console.log('📸 Image uploaded successfully:', req.file.path);
      
      // Check if Cloudinary is configured
      const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                    process.env.CLOUDINARY_API_KEY && 
                                    process.env.CLOUDINARY_API_SECRET &&
                                    process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
                                    process.env.CLOUDINARY_API_KEY !== 'your-api-key' &&
                                    process.env.CLOUDINARY_API_SECRET !== 'your-api-secret';
      
      if (isCloudinaryConfigured) {
        // Use Cloudinary URL (already a full HTTPS URL)
        category.image = req.file.path;
        console.log('☁️ Cloudinary image URL:', category.image);
      } else {
        // For local storage, construct a relative URL
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://jaifriend-backend.hgdjlive.com'
          : 'http://localhost:3001';
        const relativePath = req.file.path.replace(/\\/g, '/');
        const finalRelativePath = relativePath.startsWith('uploads/') ? relativePath : `uploads/${relativePath}`;
        category.image = `${baseUrl}/${finalRelativePath}`;
        console.log('📁 Local image URL:', category.image);
      }
    } else if (imageUrl !== undefined) {
      // Update with URL if provided (or empty string to clear)
      category.image = normalizeString(imageUrl);
    }
    
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    return res.json({
      success: true,
      message: 'Category updated successfully',
      category: formatCategoryResponse(category)
    });
  } catch (error) {
    return handleControllerError(res, error, 'Failed to update category');
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const deleted = await P2PCategory.findByIdAndDelete(categoryId);

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
    return handleControllerError(res, error, 'Failed to delete category');
  }
};

module.exports = {
  createCategory,
  getCategories,
  getPublicCategories,
  updateCategory,
  deleteCategory
};











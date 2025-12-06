const mongoose = require('mongoose');

// Generic sub-category model used for multiple feature types
// (products-sub, pages-sub, groups-sub, etc.).
const subCategorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    }
    // All other language/name fields are stored dynamically (strict: false)
  },
  {
    timestamps: true,
    strict: false
  }
);

subCategorySchema.index({ type: 1, categoryId: 1, createdAt: -1 });

module.exports = mongoose.model('SubCategory', subCategorySchema);







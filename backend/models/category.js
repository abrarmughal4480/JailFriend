const mongoose = require('mongoose');

// Generic category model used for multiple feature types (blogs, products, jobs, groups, pages).
// We keep the schema very flexible to support many language-specific fields (english, arabic, etc.).
const categorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true,
      trim: true
    }
    // NOTE: We intentionally do NOT explicitly list all possible language
    // fields here (english, arabic, etc.). Instead we rely on strict: false
    // so any string fields sent from the frontend are stored as-is.
  },
  {
    timestamps: true,
    strict: false // allow arbitrary language/name fields like "english", "arabic", etc.
  }
);

categorySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Category', categorySchema);







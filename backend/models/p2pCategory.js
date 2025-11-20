const mongoose = require('mongoose');

const sanitizeSlug = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'category';

const p2pCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      unique: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 400,
      default: ''
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

p2pCategorySchema.index({ title: 1 });
p2pCategorySchema.index({ slug: 1 });

p2pCategorySchema.pre('save', async function generateSlug(next) {
  if (!this.isModified('title') && this.slug) {
    return next();
  }

  const baseSlug = sanitizeSlug(this.title);
  let candidate = baseSlug;
  let counter = 1;

  while (
    await mongoose.models.P2PCategory.findOne({
      slug: candidate,
      _id: { $ne: this._id }
    })
  ) {
    candidate = `${baseSlug}-${counter++}`;
  }

  this.slug = candidate;
  next();
});

module.exports = mongoose.model('P2PCategory', p2pCategorySchema);









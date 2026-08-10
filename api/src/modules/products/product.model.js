const { Schema, model } = require('mongoose');
const {
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_IMAGE_URL_MAX_LENGTH,
  PRODUCT_SLUG_MAX_LENGTH,
  PRODUCT_TITLE_MAX_LENGTH,
} = require('./product-input-limits');

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
      maxlength: PRODUCT_TITLE_MAX_LENGTH,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      maxlength: PRODUCT_SLUG_MAX_LENGTH,
    },
    description: {
      type: String,
      maxlength: PRODUCT_DESCRIPTION_MAX_LENGTH,
    },
    price: { type: Number, required: true, index: true },
    images: [
      {
        type: String,
        maxlength: PRODUCT_IMAGE_URL_MAX_LENGTH,
      },
    ],
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = model('Product', productSchema);

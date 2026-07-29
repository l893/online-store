const { Schema, model } = require('mongoose');

const productSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    price: { type: Number, required: true, index: true },
    images: [String],
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = model('Product', productSchema);

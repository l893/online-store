const { Schema, model } = require('mongoose');

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: String,
    price: Number,
    image: String,
    qty: { type: Number, default: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    index: true,
  },
  items: { type: [cartItemSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = model('Cart', cartSchema);

const { Schema, model } = require('mongoose');

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    titleSnapshot: String,
    priceSnapshot: Number,
    qty: Number,
    image: String,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    items: { type: [orderItemSchema], default: [] },
    total: Number,
    status: {
      type: String,
      enum: ['draft', 'paid', 'cancelled'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = model('Order', orderSchema);

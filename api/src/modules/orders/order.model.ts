import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    titleSnapshot: String,
    priceSnapshot: Number,
    qty: Number,
    image: String,
  },
  { _id: false },
);

export type OrderItemRecord = InferSchemaType<typeof orderItemSchema>;

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    items: { type: [orderItemSchema], default: [] },
    total: Number,
    status: {
      type: String,
      enum: ['draft', 'processing', 'paid', 'cancelled'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true },
);

export type OrderRecord = InferSchemaType<typeof orderSchema>;

const Order = model<OrderRecord>('Order', orderSchema);

export default Order;

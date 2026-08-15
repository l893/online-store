import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: String,
    price: Number,
    image: String,
    qty: { type: Number, default: 1 },
  },
  { _id: false },
);

export type CartItemRecord = InferSchemaType<typeof cartItemSchema>;

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

export type CartRecord = InferSchemaType<typeof cartSchema>;

const Cart = model<CartRecord>('Cart', cartSchema);

export default Cart;

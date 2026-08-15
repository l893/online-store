import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

export type CategoryRecord = InferSchemaType<typeof categorySchema>;

const Category = model<CategoryRecord>('Category', categorySchema);

export default Category;

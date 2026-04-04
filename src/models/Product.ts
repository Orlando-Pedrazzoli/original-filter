import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    line: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isNew: { type: Boolean, default: false },
    applications: [{ brand: String, models: [{ name: String, years: String }] }],
    conversions: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

import mongoose, { Schema } from 'mongoose';

const BrandSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Brand || mongoose.model('Brand', BrandSchema);

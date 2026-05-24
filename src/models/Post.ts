/* ══════════════════════════════════════════
   Original Filter — Model Post (Blog)
   ══════════════════════════════════════════
   Ampliado:
   - publishedAt separado de createdAt (rascunho pode ficar dias antes)
   - category + tags
   - SEO embedded
   - readingTime calculado (min)
   - viewCount para ranking
   ══════════════════════════════════════════ */

import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPostSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: mongoose.Types.ObjectId;

  isPublished: boolean;
  publishedAt?: Date;

  readingTime: number; // minutos
  viewCount: number;

  seo: IPostSEO;

  createdAt: Date;
  updatedAt: Date;
}

const PostSEOSchema = new Schema<IPostSEO>(
  {
    title: { type: String, trim: true, maxlength: 70 },
    description: { type: String, trim: true, maxlength: 160 },
    keywords: { type: [String], default: [] },
  },
  { _id: false },
);

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: { type: String, default: '', trim: true, maxlength: 500 },
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    category: { type: String, default: 'geral', trim: true, lowercase: true },
    tags: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },

    readingTime: { type: Number, default: 1, min: 1 },
    viewCount: { type: Number, default: 0, min: 0 },

    seo: { type: PostSEOSchema, default: () => ({}) },
  },
  { timestamps: true },
);

// ─── Calcula readingTime e publishedAt no save ───
PostSchema.pre('save', function () {
  // readingTime: ~200 palavras por minuto (média leitor adulto)
  if (this.isModified('content') && this.content) {
    const words = this.content
      .replace(/<[^>]+>/g, ' ') // remove tags HTML
      .split(/\s+/)
      .filter(Boolean).length;
    this.readingTime = Math.max(1, Math.ceil(words / 200));
  }

  // publishedAt: setar ao publicar pela 1ª vez
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

PostSchema.index({ slug: 1 }, { unique: true });
PostSchema.index({ isPublished: 1, publishedAt: -1 });
PostSchema.index({ category: 1, isPublished: 1, publishedAt: -1 });
PostSchema.index({ tags: 1 });

// Text search
PostSchema.index(
  { title: 'text', excerpt: 'text', content: 'text' },
  { weights: { title: 10, excerpt: 5, content: 1 }, name: 'post_text_search' },
);

const Post: Model<IPost> =
  (mongoose.models.Post as Model<IPost>) || mongoose.model<IPost>('Post', PostSchema);

export default Post;

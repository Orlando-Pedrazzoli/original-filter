/* ══════════════════════════════════════════
   Original Filter — Model Counter
   ══════════════════════════════════════════
   Contador atômico genérico (orderNumber, etc).
   Usa findOneAndUpdate com $inc e upsert — atomicidade garantida pelo MongoDB.
   
   USO:
   import Counter from '@/models/Counter';
   const next = await Counter.next('order:2026');  // 1, 2, 3...
   const orderNumber = `OF-2026-${String(next).padStart(5, '0')}`;
   ══════════════════════════════════════════ */

import mongoose, { Schema, type Model } from 'mongoose';

interface ICounter {
  _id: string;
  seq: number;
}

interface ICounterModel extends Model<ICounter> {
  next(key: string): Promise<number>;
}

const CounterSchema = new Schema<ICounter, ICounterModel>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

CounterSchema.statics.next = async function (key: string): Promise<number> {
  const doc = await this.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return doc.seq;
};

const Counter =
  (mongoose.models.Counter as unknown as ICounterModel) ||
  mongoose.model<ICounter, ICounterModel>('Counter', CounterSchema);

export default Counter;

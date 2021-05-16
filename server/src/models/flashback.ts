import mongoose, { Document, Schema } from 'mongoose';

export interface IFlashback extends Document {
  name: string;
  filename: string;
  extension: string;
  count: number;
}

export const flashbackSchema = new Schema({
  name: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  extension: { type: String, required: true },
  count: { type: Number, default: 0 },
});

const Flashback = mongoose.model<IFlashback>('Flashback', flashbackSchema);

export default Flashback;

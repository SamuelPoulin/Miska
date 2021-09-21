import mongoose, { Document, Schema } from "mongoose";

export interface ISoundbite extends Document {
  name: string;
  description: string;
  filename: string;
  extension: string;
  count: number;
}

export const soundbiteSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: false, unique: false },
  filename: { type: String, required: true },
  extension: { type: String, required: true },
  count: { type: Number, default: 0 },
});

const Soundbite = mongoose.model<ISoundbite>("Soundbite", soundbiteSchema);

export default Soundbite;

import mongoose from "mongoose";

const AquariumItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'fish', 'coral', 'decor'
  label: { type: String },
  dateUnlocked: { type: Date, default: Date.now },
  userId: { type: String, required: true },
});

export default mongoose.model("AquariumItem", AquariumItemSchema);

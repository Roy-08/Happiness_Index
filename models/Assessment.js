import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  section: { type: String },
  answers: { type: Object, default: {} },
  score: { type: Number },
  category: { type: String }, // save category: luminary, seeker etc.
}, { timestamps: true });

export default mongoose.models.Assessment ||
  mongoose.model("Assessment", AssessmentSchema);

import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  marks: { type: Number, required: true },
});

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [OptionSchema],
});

const SectionSchema = new mongoose.Schema({
  sectionNumber: { type: Number, required: true },
  sectionName: { type: String, required: true },
  questions: [QuestionSchema],
});

const FormSchema = new mongoose.Schema(
  {
    headline: { type: String, required: true },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Form || mongoose.model("Form", FormSchema);

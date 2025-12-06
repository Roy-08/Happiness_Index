  import mongoose from "mongoose";

  const RegistrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dob: { type: String },
    country: { type: String },
    contact: { type: String },
    occupation: { type: String },
  }, { timestamps: true });

  export default mongoose.models.Registration ||
    mongoose.model("Registration", RegistrationSchema);

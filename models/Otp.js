import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Otp", otpSchema);

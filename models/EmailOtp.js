import mongoose from "mongoose";

const emailOtpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  code: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
},
 { timestamps: true, versionKey: false }
);

emailOtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

export default mongoose.model("EmailOtp", emailOtpSchema);

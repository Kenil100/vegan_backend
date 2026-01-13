import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentId: { type: String,default:null },
    orderId: { type: String },
    status: { type: String, enum: ["SUCCESS", "FAILED", "COD"], required: true }
  },
  { tiamestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

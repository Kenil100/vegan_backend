import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    apartment: { type: String, default: "" },

    address: { type: String, required: true },

    city: { type: String, required: true },

    state: { type: String, required: true },

    country: { type: String, required: true, default: "India" },

    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Pincode must be a 6-digit number"],
    },

    type: {
      type: String,
      enum: ["home", "office"],
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Address", addressSchema);

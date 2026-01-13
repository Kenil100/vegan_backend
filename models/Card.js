import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    cardHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    last4Digits: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 4,
    },
    expiryDate:{
    type: Date,
    required: true,
    },
    expiryMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    expiryYear: {
      type: Number,
      required: true,
    },
    cvvCode: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Card", cardSchema);

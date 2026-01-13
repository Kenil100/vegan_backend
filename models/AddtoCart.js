import mongoose, { Types } from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      requires: true,
    },
    variantLabel: {
      type: String,
      required: true,
    },
    variantValue: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    qty: {
      type: Number,
      default: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    cartTotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Cart", cartSchema);

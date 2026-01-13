import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String },
    title: { type: String },
    comment: { type: String },
    rating: { type: Number, default: 0 }
  },
  { timestamps: true, versionKey: false }
);
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: [
        "All",
        "Non-dairy",
        "Bread & Bakery",
        "Snacks & Bar",
        "Beverages",
        "Desserts",
      ],
      required: true,
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    description: { type: String },
    quantity: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings:{type:Number,default:0},
    reviews: [reviewSchema],
    additionalInfo: {
    productDescription: {
      type: String,
      trim: true,
    },
    otherProductInfo: {
        productCode:{type:String, trim: true},
        country:{type:String, trim: true},
        manufactured:{type:String, trim: true},
        address:{type:String, trim: true},
        email:{type:String, trim: true},
        phone:{type:Number,},
        bestBeforeDate:{type:Date},
    },
  },
    variants: [
      {
        label: { type: String, required: true }, // "500 ml"
        value: { type: Number, required: true }, // 500
        unit: {
          type: String,
          enum: ["gm", "kg", "ml", "liter"],
          required: true,
        },
        price: { type: Number, required: true }, // price of this variant
        isDefault: { type: Boolean, default: false }, // which variant should show by default
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Product", productSchema);

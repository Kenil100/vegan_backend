import mongoose from "mongoose";

const ChildBlogSchema = new mongoose.Schema(
  {
    mainHeading: { type: String, default: "" },
    innerHeading: { type: String, default: "" },
    description: { type: String, required: true },
    image: { type: String },        
    imageId: { type: String },     
  },
  { timestamps: true, versionKey: false }
);

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    image: { type: String },         
    imageId: { type: String },
    description: { type: String, required: true },
    otherDescription: { type: String, default: "" },
    createdByName: { type: String, required: true },
    type: {
      type: String,
      enum: ["all", "news", "health", "vegan-food"],
      default: "all",
    },
    children: [ChildBlogSchema],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Blog", BlogSchema);

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // USER FIELDS
    firstName: { type: String },
    lastName: { type: String },

    // COMMON FIELDS
    email: { type: String, unique: true, sparse: true }, 
    phone: { type: String, unique: true, sparse: true },

    // ADMIN FIELDS (login with password)
    password: { type: String }, // only admin uses password

    // ROLE (IMPORTANT)
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("User", UserSchema);

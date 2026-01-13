import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminSignup = async (req, res) => {
  try {
    const { firstName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      firstName,
      email,
      password: hashedPassword,
      role: "admin",
      phone: `admin_${Date.now()}`,
    });

    res.json({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (err) {
    console.error("Admin signup error:", err);
    res.status(500).json({ message: "Admin signup failed" });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }
    const match = await bcrypt.compare(password,admin.password);
    if(!match){
        return res.status(401).json({message:"Incorrect password"});
    }
    const token = jwt.sign(
        {id:admin._id,role:admin.role},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )
    res.json({
        success:true,
        message:"Login successful",
        token,
        admin
    });

  } catch(err) {
    console.error("Admin login error:", err);
    res.status(500).json({message:"Login failed"});
  }
};

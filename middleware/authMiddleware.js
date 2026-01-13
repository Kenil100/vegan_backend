import jwt from "jsonwebtoken";
import User from "../models/User.js";


export async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });
  const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid" });
  }
}

export const verifyToken = (req, res, next) => {
  try {
    // ✅ Read token from Authorization header
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        message: "No token",
      });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ⚠️ Your token payload uses `id`
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: "Invalid token",
    });
  }
};
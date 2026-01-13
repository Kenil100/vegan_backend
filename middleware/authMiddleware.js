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

export const verifyToken=(req, res, next)=>{
 const token = req.cookies.token;
    if (!token) return res.status(401).json({ status:401,message: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ status:401,message: "Invalid token" });
  }
}
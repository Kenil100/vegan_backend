import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.js";
import addressRoutes from "./routes/address.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import contactUs from "./routes/contactUs.js";
import blogRoutes from "./routes/blogRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cookieParser from "cookie-parser";
import {connectDB} from './config/db.js';

dotenv.config();
connectDB();
const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173","https://vegevo.netlify.app/"],
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    credentials: true
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/blog", blogRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contactus", contactUs);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in PORT ${PORT}`);
});


import express from "express";
import { createOrder, verifyPayment, saveCOD } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/cod", saveCOD);

export default router;

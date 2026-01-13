import crypto from "crypto";
import Razorpay from "razorpay";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Cart from "../models/AddtoCart.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key_id: process.env.RAZOR_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      userName,
      productId,
      productName,
      productImage,
      amount,
      address,
      phone,
      items,
    } = req.body;

    // 🔐 Verify Razorpay Signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZOR_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.json({ success: false, message: "Invalid signature" });
    }

    // 💾 Save Payment
    await Payment.create({
      userId,
      userName,
      productId,
      productName,
      amount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "SUCCESS",
      address,
      phone,
      items,
    });

    // 💾 Save Order
    const order = await Order.create({
      userId,
      userName,
      productId,
      productName,
      productImage,
      amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentMode: "ONLINE",
      address,
      phone,
      items,
    });

    // ⭐ AUTO GENERATE TIMELINE (IMPORTANT)
    order.generateTimeline();
    await order.save();

    return res.json({
      success: true,
      message: "Payment Verified",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

export const saveCOD = async (req, res) => {
  try {
    const { userId, userName, productId, productName, productImage, amount, address, phone, items } = req.body;
    await Payment.create({ userId, userName, productId, productName, amount, status: "COD"});
    const order = await Order.create({ userId, userName, productId, productName, productImage, amount, orderId: "COD-" + Date.now(), paymentMode: "COD", address, phone, items});
    order.generateTimeline();
    await order.save();
    await Cart.deleteMany({userId});
    return res.status(201).json({ status: 201, message: "Order booked with Cash on Delivery!",data:order });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
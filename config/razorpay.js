import Razorpay from "razorpay";
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});

module.exports = razorpay;
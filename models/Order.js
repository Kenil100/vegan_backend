import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: null },
  completed: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    productImage: { type: String },
    amount: { type: Number, required: true },
    paymentId: { type: String },
    orderId: { type: String },
    paymentMode: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    address: {
      type: Object,
      default: null,
    },
    phone: {
      type: String,
      default: "",
    },
    items: {
      type: Array,
      default: [],
    },
    tracking: {
      type: [trackingSchema],
      default: [],
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

/* -----------------------------------------------------
   AUTO TIMELINE CREATION (5-DAY DELIVERY)
----------------------------------------------------- */
orderSchema.methods.generateTimeline = function () {
  const created = new Date(this.createdAt); // FIXED: created defined

  const timeline = [
    { status: "Order Placed", days: 0 },
    { status: "Order Confirmed", days: 1 },
    { status: "Shipped", days: 2 },
    { status: "Out for Delivery", days: 3 },
    { status: "Delivered", days: 4 },
  ];

  this.tracking = timeline.map((step) => {
    const date = new Date(created);
    date.setDate(created.getDate() + step.days);
    return {
      status: step.status,
      date,
      completed: date <= new Date(),
    };
  });

  return this.tracking;
};


export default mongoose.model("Order", orderSchema);

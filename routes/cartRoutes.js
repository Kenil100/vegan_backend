import express from "express";
import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/AddtoCart.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/getcartitems", getCart);
router.put("/update", updateCartItem);
router.delete("/remove/:userId/:key", removeCartItem);

export default router;

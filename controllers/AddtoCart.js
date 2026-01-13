import Cart from "../models/AddtoCart.js";
import Product from "../models/Product.js";

export const addToCart = async (req, res) => {
  try {
    const { userId, productId, variantLabel, variantValue, unit, price, qty } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ status: 404, message: "Product not found!" });

    let cart = await Cart.findOne({ userId });
    const subtotal = price * qty;

    const newItem = {productId,name: product.name,image: product.images[0].url,variantLabel,variantValue,unit,price,qty,subtotal,};

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [newItem],
        cartTotal: subtotal,
      });
      return res.status(200).json({ status: 200, message: "Product has been added to your cart.",data:cart });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId && item.variantLabel === variantLabel);
    if (existingItem) {
      return res.status(409).json({ status: 409, message: "Items already exits in cart!" });
    }

    cart.items.push(newItem);
    cart.cartTotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    await cart.save();
    return res.status(200).json({ status: 200, message: "Product has been added to your cart.",data:cart });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const { userId } = req.query;
    const cart = await Cart.findOne({ userId });
    return res.status(200).json({ status: 200, message: "Cart Items fetched successfully", data: cart });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { key, qty, userId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ status: 404, message: "No cart items found!" });

    const item = cart.items[key];
    if (!item) return res.status(404).json({ status: 404, message: "Items not found!" });

    item.qty = qty;
    item.subtotal = qty * item.price;

    cart.cartTotal = cart.items.reduce((sum, i) => sum + i.subtotal, 0);
    await cart.save();

    return res.status(200).json({ status: 200, message: "Quantity updated successfully", data: cart });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { userId, key } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ status: 404, message: "No cart items found!" });

    cart.items.splice(key, 1);
    if (cart.items.length === 0) {
      await Cart.findOneAndDelete({ userId });
      return res.status(200).json({ status: 200, message: "Cart is empty, cart deleted successfully", data: null });
    }
    cart.cartTotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    await cart.save();

    return res.status(200).json({ status: 200, message: "Item removed successfully", data: cart });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

import express from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();

function validSessionId(id) {
  return typeof id === "string" &&
    /^[a-zA-Z0-9-]{10,100}$/.test(id);
}

function validObjectId(id) {
  return mongoose.isValidObjectId(id);
}

// Return the cart with product information and totals
async function sendCart(sessionId, res, status = 200) {
  const cart = await Cart.findOne({ sessionId })
    .populate("items.product");

  if (!cart) {
    return res.status(status).json({
      items: [],
      total: 0
    });
  }

  const items = cart.items
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    }));

  const total = items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  return res.status(status).json({ items, total });
}

// GET cart
router.get("/:sessionId", async (req, res) => {
  try {
    if (!validSessionId(req.params.sessionId)) {
      return res.status(400).json({
        message: "Invalid cart session"
      });
    }

    return await sendCart(req.params.sessionId, res);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve cart"
    });
  }
});

// ADD product to cart
router.post("/:sessionId/items", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId } = req.body;

    if (!validSessionId(sessionId)) {
      return res.status(400).json({
        message: "Invalid cart session"
      });
    }

    if (!validObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    let cart = await Cart.findOne({ sessionId });

    if (!cart) {
      cart = new Cart({ sessionId, items: [] });
    }

    const item = cart.items.find(
      (entry) => entry.product.toString() === productId
    );

    const newQuantity = item ? item.quantity + 1 : 1;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        message: "Available stock limit reached"
      });
    }

    if (item) {
      item.quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity: 1
      });
    }

    await cart.save();

    return await sendCart(sessionId, res);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to add product to cart"
    });
  }
});

// UPDATE item quantity
router.patch("/:sessionId/items/:productId", async (req, res) => {
  try {
    const { sessionId, productId } = req.params;
    const quantity = req.body.quantity;

    if (
      !validSessionId(sessionId) ||
      !validObjectId(productId)
    ) {
      return res.status(400).json({
        message: "Invalid cart or product ID"
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock"
      });
    }

    const cart = await Cart.findOne({ sessionId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const item = cart.items.find(
      (entry) => entry.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found in cart"
      });
    }

    item.quantity = quantity;
    await cart.save();

    return await sendCart(sessionId, res);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to update quantity"
    });
  }
});

// REMOVE item from cart
router.delete("/:sessionId/items/:productId", async (req, res) => {
  try {
    const { sessionId, productId } = req.params;

    if (
      !validSessionId(sessionId) ||
      !validObjectId(productId)
    ) {
      return res.status(400).json({
        message: "Invalid cart or product ID"
      });
    }

    const cart = await Cart.findOne({ sessionId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        message: "Item not found in cart"
      });
    }

    await cart.save();

    return await sendCart(sessionId, res);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to remove product"
    });
  }
});

export default router;

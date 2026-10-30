
import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// PLACE ORDER
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.pincode
    ) {
      return res.status(400).json({
        message: "Please provide complete shipping details.",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      const quantity = Number(item.quantity);

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: "Invalid quantity.",
        });
      }

      const price = Number(product.price);

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity,
      });

      totalAmount += price * quantity;
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: "COD",
      status: "Placed",
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order,
    });

  } catch (error) {
    console.error("Place order error:", error);

    return res.status(500).json({
      message: error.message || "Unable to place your order.",
    });
  }
});


// GET MY ORDERS
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error("Fetch orders error:", error);

    return res.status(500).json({
      message: "Unable to fetch your orders.",
    });
  }
});

export default router;

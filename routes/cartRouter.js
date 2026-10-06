const express = require("express");
const router = express.Router();

const { cookieAuth } = require("../middleware/auth");

const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
} = require("../controllers/cartController");

// Get Cart
router.get("/", cookieAuth, getCart);

// Add Book To Cart
router.post("/add", cookieAuth, addToCart);

// Update Cart Item Quantity
router.put("/update", cookieAuth, updateCart);

// Remove Book From Cart
router.delete("/remove/:bookId", cookieAuth, removeFromCart);

module.exports = router;

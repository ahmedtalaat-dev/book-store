const express = require("express");
const router = express.Router();
const Cart = require("../models/cartSchema");
const Book = require("../models/bookSchema");

const { cookieAuth } = require("../auth/middleware");

router.get("/", cookieAuth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
      "title price coverImage stock",
    );

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      cart,
    });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving cart",
      error: error.message,
    });
  }
});

router.post("/add", cookieAuth, async (req, res) => {
  console.log("req.body:", req.body);
  try {
    const { bookId } = req.body;
    console.log("Received bookId:", bookId);

    const book = await Book.findById(bookId);

    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
      "title price coverImage stock",
    );

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (it) =>
        (it.book._id ? it.book._id.toString() : it.book.toString()) === bookId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ book: bookId, price: book.price, quantity: 1 });
    }
    book.stock -= 1;
    await book.save();

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.book",
      "title price coverImage stock",
    );

    return res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
});

router.put("/update", cookieAuth, async (req, res) => {
  try {
    const { bookId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
      "title price coverImage stock",
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((it) => it.book._id.toString() === bookId);

    const book = await Book.findById(bookId);

    const diff = quantity - item.quantity;

    if (diff > 0) {
      if (book.stock < diff)
        return res.status(400).json({ message: "Not enough stock" });

      book.stock -= diff;
    } else {
      book.stock += Math.abs(diff);
    }

    item.quantity = quantity;
    await book.save();

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.book",
      "title price coverImage stock",
    );

    return res.json({ success: true, cart: populatedCart });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating cart", error: err.message });
  }
});

router.delete("/remove/:bookId", cookieAuth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (it) => it.book.toString() === bookId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    const item = cart.items[itemIndex];
    const book = await Book.findById(bookId);

    if (book) {
      book.stock += 1;
      await book.save();
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.book",
      "title price coverImage stock",
    );

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing item", error: error.message });
  }
});

module.exports = router;

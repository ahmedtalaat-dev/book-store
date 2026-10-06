const Cart = require("../models/cartSchema");
const Book = require("../models/bookSchema");

// Get Cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
      "title price coverImage stock",
    );

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });

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
};

// Add Book To Cart
const addToCart = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Book ID is required",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book is out of stock",
      });
    }

    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
      "title price coverImage stock",
    );

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        (item.book._id ? item.book._id.toString() : item.book.toString()) ===
        bookId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({
        book: bookId,
        price: book.price,
        quantity: 1,
      });
    }

    // Reduce stock
    book.stock -= 1;
    await book.save();

    // Update cart totals
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

    return res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);

    return res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: error.message,
    });
  }
};

// Update Cart Item Quantity
const updateCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;

    if (!bookId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Book ID and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.book", "title price coverImage stock");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find((item) => item.book._id.toString() === bookId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const diff = quantity - item.quantity;

    // Increasing quantity
    if (diff > 0) {
      if (book.stock < diff) {
        return res.status(400).json({
          success: false,
          message: "Not enough stock",
        });
      }

      book.stock -= diff;
    }

    // Decreasing quantity
    else if (diff < 0) {
      book.stock += Math.abs(diff);
    }

    item.quantity = quantity;

    await book.save();

    // Update totals
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

    return res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating cart",
      error: error.message,
    });
  }
};

// Remove Book From Cart
const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const item = cart.items[itemIndex];

    const book = await Book.findById(bookId);

    // Restore the entire quantity back to stock
    if (book) {
      book.stock += item.quantity;
      await book.save();
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);

    // Update totals
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

    return res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Error removing item:", error);

    return res.status(500).json({
      success: false,
      message: "Error removing item",
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
};

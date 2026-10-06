const Book = require("../models/bookSchema");

// Create Book
const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      price,
      stock,
      isFeautred,
      category,
      discountPercent,
      isOnSale,
    } = req.body;

    if (!title || !author || !description || !price || !stock) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const newBook = new Book({
      title,
      author,
      description,
      price,
      stock,
      isFeautred,
      isOnSale,
      discountPercent,
      category,
      coverImage: req.file?.filename,
    });

    await newBook.save();

    return res.status(201).json({
      message: "Book created successfully",
      book: newBook,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get All Books
const getBooks = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    const books = await Book.find().populate("category", "name");

    return res.json(books);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get Single Book
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "category",
      "name",
    );

    if (!book) {
      return res.status(404).json({
        message: "Book Is Not Found",
      });
    }

    return res.json(book);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Update Book
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("category", "name");

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    return res.json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Delete Book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    return res.json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
};

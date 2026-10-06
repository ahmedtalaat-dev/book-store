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
      isFeatured,
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
      isFeatured,
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
    console.error("Error creating book:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get All Books
const getBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("category", "name");

    return res.status(200).json(books);
  } catch (error) {
    console.error("Error getting books:", error);

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
        message: "Book is not found",
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error("Error getting book:", error);

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
      runValidators: true,
    }).populate("category", "name");

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    return res.status(200).json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    console.error("Error updating book:", error);

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

    return res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);

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

const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },

  filename: function (req, file, cb) {
    const filename = Date.now() + "-" + file.fieldname;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Create Book
router.post("/createBook", upload.single("coverImage"), createBook);

// Get All Books
router.get("/getBooks", getBooks);

// Get Single Book
router.get("/:id", getBookById);

// Update Book
router.put("/updateBook/:id", updateBook);

// Delete Book
router.delete("/deleteBook/:id", deleteBook);

module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { cookieAuth } = require("../middleware/auth");
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/adminController");

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
const upload = multer({ storage: storage });

// Create Book
router.post("/createBook", cookieAuth, upload.single("coverImage"), createBook);

// Get All Books
router.get("/getBooks", cookieAuth, getBooks);

// Get Single Book
router.get("/:id", cookieAuth, getBookById);

// Update Book
router.put("/updateBook/:id", cookieAuth, updateBook);

// Delete Book
router.delete("/deleteBook/:id", cookieAuth, deleteBook);

module.exports = router;

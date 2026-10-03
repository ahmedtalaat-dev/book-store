const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  author: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  stock: {
    type: Number,
    required: true,
    default: 0,
  },

  isFeatured: {
    type: Boolean,
    default: false,
  },

  isOnSale: {
    type: Boolean,
    default: false,
  },

  discountPercent: {
    type: Number,
    default: 0,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  coverImage: {
    type: String,
  },
});

module.exports = mongoose.models.Book || mongoose.model("Book", BookSchema);

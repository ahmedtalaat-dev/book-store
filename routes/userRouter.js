const express = require("express");
const router = express.Router();

const { cookieAuth } = require("../middleware/auth");

const {
  register,
  signin,
  verify,
  logout,
  getUserById,
} = require("../controllers/userController");

router.post("/register", register);

router.post("/signin", signin);

router.get("/verify", cookieAuth, verify);

router.post("/logout", logout);

router.get("/:id", getUserById);

module.exports = router;

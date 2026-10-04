const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email and Name and password are required" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: "user",
    });

    await newUser.save();

    const token = jwt.sign(
      {
        email,
        id: newUser._id,
        role: newUser.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1w",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token,
      role: newUser.role,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const signin = async (req, res) => {
  try {
    const { password, email } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const role = (user.role || "user").trim();

      const token = jwt.sign(
        {
          email,
          id: user._id,
          role,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "1w",
        },
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const redirectPath = role === "admin" ? "/admin" : "/";

      console.log({ role, redirectPath });

      return res.status(200).json({
        message: "User Signin successfully",
        user,
        token,
        role,
        redirect: redirectPath,
      });
    }

    return res.status(400).json({
      message: "Invalid email or password",
    });
  } catch (error) {
    console.error("Signin error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const verify = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Token valid",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  register,
  signin,
  verify,
  logout,
  getUserById,
};

const express = require("express");
const app = express();

const cors = require("cors");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
app.use(cookieParser());

connectDB();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/users", require("./routes/userRouter"));
app.use("/admin", require("./routes/adminRouter"));
app.use("/books", require("./routes/bookRouter"));
app.use("/categories", require("./routes/categoryRouter"));
app.use("/cart", require("./routes/cartRouter"));

app.use("/images", express.static("images"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

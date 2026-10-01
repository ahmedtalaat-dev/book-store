const express = require("express");
const app = express();

const cors = require("cors");
require('dotenv').config();
const connectDB = require("./config/db");

connectDB();

app.use(cors());
app.use(express.json());
app.use("/images", express.static("images"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

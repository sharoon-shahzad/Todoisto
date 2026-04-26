import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
dotenv.config({
  path: "./.env",
});

connectDB();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});


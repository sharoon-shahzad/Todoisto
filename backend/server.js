import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
import cookieparser from "cookie-parser";


import authRoutes from "./src/routes/auth/authRoutes.js";

const app = express();


app.use(cookieparser());


dotenv.config({
  path: "./.env",
});

connectDB();



app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

// register api routes here
app.use("/api/users",authRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});


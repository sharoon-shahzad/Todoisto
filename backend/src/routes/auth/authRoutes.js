
import express from "express";

const route = express.Router();

route.post("/register", authController.registerUser);

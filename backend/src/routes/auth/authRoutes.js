
import express from "express";
import authController from "../../controllers/authcontroller.js";
import verifyJwt from "../../middlewares/auth.middleware.js";

const route = express.Router();

route.post("/register", authController.registerUser);
route.post("/login", authController.loginUser);
route.post("/refresh-token", authController.refreshToken);
route.post("/logout", verifyJwt, authController.logoutUser);

export default route;

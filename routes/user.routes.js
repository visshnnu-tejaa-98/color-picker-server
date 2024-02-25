import express from "express";
import {
  forgot,
  login,
  loginOTPResponse,
  loginOTPRequest,
  logout,
  reset,
  signup,
} from "../controllers/auth.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot", forgot);
router.post("/reset", reset);
router.post("/otprequest", loginOTPRequest);
router.post("/otpresponse", loginOTPResponse);
router.post("/logout", isLoggedIn, logout);

export default router;

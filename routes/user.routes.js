import express from "express";
import {
  forgot,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot", forgot);
router.post("/logout", isLoggedIn, logout);

export default router;

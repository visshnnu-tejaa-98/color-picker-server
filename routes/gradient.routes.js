import express from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  addGradient,
  deleteGradient,
  getAllGradients,
  getAllGradientsByUser,
  getGradientById,
  updateGradient,
} from "../controllers/gradient.controller.js";

const router = express.Router();

router.post("/addGradient", isLoggedIn, addGradient);
router.delete("/deleteGradient", isLoggedIn, deleteGradient);
router.put("/updateGradient/:id", isLoggedIn, updateGradient);
router.get("/byuser", isLoggedIn, getAllGradientsByUser);
router.post("/details", isLoggedIn, getGradientById);
router.get("/", getAllGradients);

export default router;

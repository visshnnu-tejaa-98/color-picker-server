import express from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  addPalette,
  deletePalette,
  getAllPalette,
  getPaletteById,
  getPaletteByUser,
  updatePalette,
} from "../controllers/palette.controller.js";

const router = express.Router();

router.post("/addPalette", isLoggedIn, addPalette);
router.delete("/deletePalette", isLoggedIn, deletePalette);
router.put("/updatePalette/:id", isLoggedIn, updatePalette);
router.get("/byuser", isLoggedIn, getPaletteByUser);
router.post("/details", isLoggedIn, getPaletteById);
router.get("/", getAllPalette);

export default router;

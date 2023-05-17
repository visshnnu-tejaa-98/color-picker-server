import express from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  AddFavourite,
  deleteFavouritesByUserId,
  getFavouritesByUserId,
  removeFavourite,
} from "../controllers/favourites.controller.js";

const router = express.Router();

router.post("/add", isLoggedIn, AddFavourite);
router.post("/remove", isLoggedIn, removeFavourite);
router.get("/getFavourite", isLoggedIn, getFavouritesByUserId);
router.delete("/deteleFavourite", isLoggedIn, deleteFavouritesByUserId);

export default router;

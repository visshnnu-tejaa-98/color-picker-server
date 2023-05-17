import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/connection.js";
import UserRoutes from "./routes/user.routes.js";
import gradientRoutes from "./routes/gradient.routes.js";
import paletteRoutes from "./routes/palette.routes.js";
import FavouriteRoutes from "./routes/favourite.routes.js";

const PORT = process.env.PORT || 8000;

const app = express();

connectDB();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) =>
  res.send(`Server is up and running in port ${PORT}`)
);

app.use("/api/v1/auth", UserRoutes);
app.use("/api/v1/gradient", gradientRoutes);
app.use("/api/v1/palette", paletteRoutes);
app.use("/api/v1/favourite", FavouriteRoutes);

app.listen(PORT, () =>
  console.log(`🚀🚀Color Picker server is up and running in ${PORT}🚀🚀`)
);

import JWT from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.schema.js";
import CustomError from "../utils/CustomError.js";
import { jwtDecode } from "jwt-decode";

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.cookies.token ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer"))
  ) {
    token = req.cookies.token || req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    throw new CustomError("Not authorized to access this resource", 401);
  }

  try {
    let isGoogleUser =
      jwtDecode(req?.headers?.authorization)?.iss ===
      "https://accounts.google.com"
        ? true
        : false;
    if (isGoogleUser) {
      req.user = await User.findOne({
        email: jwtDecode(req.headers.authorization)?.email,
      });
      next();
    } else {
      const decodedJwtPayload = JWT.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decodedJwtPayload._id, "name email role");
      next();
    }
  } catch (error) {
    throw new CustomError("Not authorized to access this resource", 401);
  }
});

export const authorize = (...requiredRoles) =>
  asyncHandler(async (req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
      throw new CustomError("You are not authorized to access this resource");
    }
    next();
  });

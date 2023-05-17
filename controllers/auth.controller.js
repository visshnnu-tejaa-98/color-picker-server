import User from "../models/user.schema.js";
import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/CustomError.js";

export const cookieOptions = {
  expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

/******************************************************
 * @SIGNUP
 * @route http://localhost:8000/api/v1/auth/signup
 * @description User signUp Controller for creating new user
 * @returns User Object
 ******************************************************/

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    throw new CustomError("Please Fill all required Fields", 400);
  let existingUser = await User.findOne({ email });
  if (existingUser) throw new CustomError("User Already Exists", 400);
  let user = await User.create({ name, email, password });
  let token = user.getJWTToken();
  user.password = undefined;
  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    user,
    token,
  });
});

/******************************************************
 * @LogIn
 * @route http://localhost:9000/api/v1/auth/login
 * @description User login Controller to login user
 * @returns User Object
 ******************************************************/

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new CustomError("Please Fill all required Fields", 400);
  const user = await User.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) throw new CustomError("Incorrect password", 400);
  const token = user.getJWTToken();
  user.password = undefined;
  res.cookie("token", token, cookieOptions);
  res.status(200).json({ success: true, user, token });
});

/******************************************************
 * @Logout
 * @route http://localhost:9000/api/v1/auth/logout
 * @description User Logout Controller to logout user
 * @returns status message
 ******************************************************/

export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res
    .status(200)
    .json({ success: true, message: "User Logged out Sucessfully" });
});

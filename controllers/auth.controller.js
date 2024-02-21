import User from "../models/user.schema.js";
import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/CustomError.js";
import { sendEMailToUser } from "../utils/nodemailer/index.js";
import { resetPasswordEmail } from "../utils/nodemailer/resetPasswordEmail.js";

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

/******************************************************
 * @Forgot Password
 * @route http://localhost:9000/api/v1/auth/forgot
 * @description User forgot controller when user forgot password - used to fire an email to rest password
 * @returns status message
 ******************************************************/

export const forgot = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError("Please Fill all required Fields", 400);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError(
      "User not found, Try Signing up to our application",
      404
    );
  }
  const forgotPasswordToken = Date.now().toString();
  const resetLink = `${process.env.FE_ORIGIN}/reset/${forgotPasswordToken}`;
  console.log({ resetLink });
  await User.updateOne(
    { email: user.email },
    { forgotPasswordToken: forgotPasswordToken }
  );
  console.log({ user });
  const options = {
    name: "UI-Color-Picker",
    address: process.env.EMAIL,
    recieverEmail: user.email,
    subject: "Testing for Node Mailer",
    html: resetPasswordEmail(user.name, resetLink),
  };
  const emailStatus = sendEMailToUser(options);
  if (emailStatus) {
    res.status(200).json({ success: true, message: "Mail Sent" });
  } else {
    res.status(400).json({ success: false, message: "Something went wrong!" });
  }
});

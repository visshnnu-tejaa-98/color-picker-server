import User from "../models/user.schema.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  APPLICATION_NAME,
  LOGIN_OTP_SUBJECT,
  RESET_PASSWORD_SUBJECT,
} from "../utils/constants.js";
import CustomError from "../utils/CustomError.js";
import { sendEMailToUser } from "../utils/nodemailer/index.js";
import { otpLoginEmail } from "../utils/nodemailer/otpLoginEmail.js";
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
    throw new CustomError("Please Enter Email", 400);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError(
      "User not found, Try Signing up to our application",
      404
    );
  }
  const forgotPasswordToken = Date.now().toString();
  const resetLink = `${process.env.FE_ORIGIN}/reset?token=${forgotPasswordToken}`;
  await User.updateOne(
    { email: user.email },
    { forgotPasswordToken: forgotPasswordToken }
  );
  const options = {
    name: APPLICATION_NAME,
    address: process.env.EMAIL,
    recieverEmail: user.email,
    subject: RESET_PASSWORD_SUBJECT,
    html: resetPasswordEmail(user.name, resetLink),
  };
  const emailStatus = sendEMailToUser(options);
  if (emailStatus) {
    res
      .status(200)
      .json({ success: true, message: "Mail Sent, Please Check Your Inbox" });
  } else {
    throw new CustomError("Something went wrong!, please try again", 400);
  }
});

/******************************************************
 * @Reset Password
 * @route http://localhost:9000/api/v1/auth/reset
 * @description To reset the password while user forgot the password
 * @returns status message
 ******************************************************/

export const reset = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const { email, password } = req.body;

  if (!token) throw new CustomError("Token Not passed, Please Try again", 400);
  if (!password)
    throw new CustomError("Password Required, Please Enter Password", 400);
  if (password.length < 8)
    throw new CustomError("Password must be atleast 8 Characters", 400);
  if (password.length > 20)
    throw new CustomError("Password must be less than 20 Characters", 400);

  const user = await User.findOne({ forgotPasswordToken: token });
  if (!user) {
    throw new CustomError(
      "User not found, Try Signing up to our application",
      404
    );
  }
  if (user?.forgotPasswordToken !== token) {
    throw new CustomError("Token Mismatch, Please Try Again!", 400);
  }
  await User.updateOne(
    { forgotPasswordToken: token },
    { password, $unset: { forgotPasswordToken: 1 } }
  );
  let JWTtoken = user.getJWTToken();
  user.password = undefined;
  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    user,
    JWTtoken,
  });
});

/******************************************************
 * @Login OTP Request
 * @route http://localhost:9000/api/v1/auth/otprequest
 * @description To send OTP through email to login application
 * @returns status message
 ******************************************************/

export const loginOTPRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError("Please Enter Email", 400);
  }
  const user = await User.findOne({ email });
  const otp = Date.now()
    .toString()
    .slice(Date.now().toString().length - 6, Date.now().toString().length);
  if (!user) throw new CustomError("User not found", 404);
  await User.updateOne({ email }, { loginOTP: otp }, { runValidators: true });
  const options = {
    name: APPLICATION_NAME,
    address: process.env.EMAIL,
    recieverEmail: user.email,
    subject: LOGIN_OTP_SUBJECT,
    html: otpLoginEmail(user.name, otp),
  };
  const emailStatus = sendEMailToUser(options);
  if (emailStatus) {
    res.status(200).json({
      success: true,
      message: "OTP sent to your regestered email, Please Check Your Inbox",
    });
  } else {
    throw new CustomError("Something went wrong!, please try again", 400);
  }
});

/******************************************************
 * @Login OTP Response
 * @route http://localhost:9000/api/v1/auth/otpresponse
 * @description To validate entered otp is valid or not
 * @returns User Object
 ******************************************************/
export const loginOTPResponse = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email) {
    throw new CustomError("Please Enter Email", 400);
  }
  if (!otp) {
    throw new CustomError("Please Enter OTP", 400);
  }
  const user = await User.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);
  if (user.loginOTP !== otp) {
    throw new CustomError("Incorrect OTP, Please Try again", 404);
  }
  // delete otp
  await User.updateOne({ email }, { $unset: { loginOTP: 1 } });
  const token = user.getJWTToken();
  user.password = undefined;
  res.cookie("token", token, cookieOptions);
  res.status(200).json({ success: true, user, token });
});

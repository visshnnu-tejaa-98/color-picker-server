import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { roles } from "../utils/roles.js";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required"],
      minLength: [4, "Name must be atleast 4 Characters"],
      mixLength: [50, "Name must be less than 50 Characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
    },
    password: {
      type: String,
      require: [true, "Password is required"],
      minLength: [8, "Password must be atleast 8 Characters"],
      maxLength: [20, "Password must be less than 20 Characters"],
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.USER,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    loginOTP: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("updateOne", async function (next) {
  const data = this.getUpdate();
  if (!data.password) return next();
  data.password = await bcrypt.hash(data.password, 10);
  next();
});

userSchema.methods = {
  comparePassword: async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  },
  getJWTToken: function () {
    return jwt.sign(
      {
        _id: this._id,
        role: this.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
  },
  generateForgotPasswordToken: function () {
    const forgotToken = crypto.randomBytes(20).toString("hex");
    this.forgotPasswordExpiry = 10 * 60 * 1000;
    return forgotToken;
  },
};

export default mongoose.model("User", userSchema);

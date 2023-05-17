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
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
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

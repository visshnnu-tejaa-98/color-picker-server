import Gradient from "../models/color-gradient.schema.js";
import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/CustomError.js";

/******************************************************
 * @Get gradient by Id
 * @route http://localhost:9000/api/v1/gradient/:id
 * @description Get the details of gradient by Id
 * @returns Gradient Object
 ******************************************************/

export const getGradientById = asyncHandler(async (req, res) => {
  const { id, populateUser } = req.body;
  let gradient;
  if (!id) throw new CustomError("Please Provide appropriate ids", 400);
  if (populateUser !== true) {
    gradient = await Gradient.find({ _id: id });
  } else {
    gradient = await Gradient.find({ _id: id }).populate(
      "userId",
      "name email role"
    );
  }
  res.status(200).json({ sucess: true, gradient });
});

/******************************************************
 * @Get All gradients
 * @route http://localhost:9000/api/v1/gradient
 * @description Get the details of gradients
 * @returns List of all Gradients
 ******************************************************/

export const getAllGradients = asyncHandler(async (req, res) => {
  const gradients = await Gradient.find({}).sort({ updatedAt: "desc" });
  res.status(200).json({ sucess: true, gradients });
});

/******************************************************
 * @Get All gradients by userId
 * @route http://localhost:9000/api/v1/gradient/byuser
 * @description Get the details of gradients by user
 * @returns List of all Gradients by user
 ******************************************************/
export const getAllGradientsByUser = asyncHandler(async (req, res) => {
  const gradients = await Gradient.find({ userId: req.user._id }).sort({
    updatedAt: "desc",
  });
  res.status(200).json({ sucess: true, gradients });
});

/******************************************************
 * @Get Add Gradient
 * @route http://localhost:9000/api/v1/gradient/addGradient
 * @description Add Gradient to database
 * @returns Created Gradient
 ******************************************************/

export const addGradient = asyncHandler(async (req, res) => {
  const { colors, userId, direction, angle, user } = req.body;
  let colorsArray = colors.split(";");
  if (colorsArray.length > 3 || colorsArray.length < 2)
    throw new CustomError(
      "Minimum of 2 or Maximum of 3 colors are accepted",
      400
    );

  let gradient = await Gradient.create({
    userId,
    colors: colorsArray,
    direction,
    angle,
  });
  res.status(201).json({
    sucess: true,
    gradient,
  });
});

/******************************************************
 * @Get Update Gradient
 * @route http://localhost:9000/api/v1/gradient/updateGradient/:id
 * @description Update Gradient by Id
 * @returns Updated Gradient
 ******************************************************/

export const updateGradient = asyncHandler(async (req, res) => {
  const { colors, userId, direction, angle } = req.body;
  const { id } = req.params;
  let colorsArray = colors.split(";");
  if (colorsArray.length > 3 || colorsArray.length < 2)
    throw new CustomError(
      "Minimum of 2 or Maximum of 3 colors are accepted",
      400
    );
  const gradient = await Gradient.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { colors: colorsArray, direction, angle },
    { new: true, runValidators: true }
  );

  res.status(200).json({ sucess: true, gradient });
});

/******************************************************
 * @Get Detete Gradient
 * @route http://localhost:9000/api/v1/gradient/deleteGradient/:id
 * @description Delete Gradient by Id
 * @returns Status of event
 ******************************************************/

export const deleteGradient = asyncHandler(async (req, res) => {
  const { id, email } = req.body;
  const gradient = await Gradient.findById(id).populate("userId", "email");
  if (gradient) {
    if (gradient.userId.email === email) {
      await Gradient.findByIdAndDelete({ _id: id });
      res
        .status(200)
        .json({ sucess: true, message: "Gradient Deleted Sucessfully" });
    } else {
      throw new CustomError("Gradient Not found", 404);
    }
  } else {
    throw new CustomError("Gradient Not found", 404);
  }
});

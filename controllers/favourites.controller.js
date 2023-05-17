import Favourite from "../models/favourites.schema.js";
import asyncHandler from "../utils/asyncHandler.js";
import { GRADIENT, PALETTE } from "../utils/constants.js";
import CustomError from "../utils/CustomError.js";

/******************************************************
 * @Get Add Favourite
 * @route http://localhost:8000/api/v1/favourite/add
 * @description Add Favourite to database (gradient or palette)
 * @returns Gradient Object
 ******************************************************/

export const AddFavourite = asyncHandler(async (req, res) => {
  const { category, gradientId, paletteId } = req.body;
  console.log(category, gradientId, paletteId);
  let favourite;
  if (!(category && (gradientId || paletteId)))
    throw new CustomError("Please provide necessary details", 400);

  let collection = await Favourite.find({ userId: req.user.id });
  if (collection.length === 0) {
    if (category === GRADIENT) {
      favourite = await Favourite.create({
        userId: req.user.id,
        gradients: [
          {
            gradientId,
          },
        ],
      });
      res.status(200).json({
        sucess: true,
        favourite,
      });
    } else if (category === PALETTE) {
      favourite = await Favourite.create({
        userId: req.user.id,
        palette: [
          {
            paletteId,
          },
        ],
      });
      res.status(200).json({
        sucess: true,
        favourite,
      });
    } else {
      throw new CustomError("Provided category is incorrect", 400);
    }
  } else {
    if (category === GRADIENT) {
      favourite = await Favourite.findOneAndUpdate(
        {
          userId: req.user.id,
        },
        {
          $push: {
            gradients: { gradientId },
          },
        },
        { new: true, runValidators: true }
      );
      res.status(200).json({
        sucess: true,
        favourite,
      });
    } else if (category === PALETTE) {
      favourite = await Favourite.findOneAndUpdate(
        {
          userId: req.user.id,
        },
        {
          $push: {
            palette: { paletteId },
          },
        },
        { new: true, runValidators: true }
      );
      res.status(200).json({
        sucess: true,
        favourite,
      });
    } else {
      throw new CustomError("Provided category is incorrect", 400);
    }
  }
});

/******************************************************
 * @Get Remove Favourite
 * @route http://localhost:8000/api/v1/favourite/remove
 * @description Remove Favourite from database (gradient or palette)
 * @returns Updated Favourite
 ******************************************************/
export const removeFavourite = asyncHandler(async (req, res) => {
  const { category, id } = req.body;
  //   const { id } = req.params;
  if (category === GRADIENT) {
    await Favourite.updateOne(
      { userId: req.user.id },
      {
        $pull: {
          gradients: { gradientId: id },
        },
      },
      { new: true, runValidators: true }
    );
    let updatedFavourite = await Favourite.findOne({ userId: req.user.id });
    res.status(200).json({ sucess: true, updatedFavourite });
  } else if (category === PALETTE) {
    await Favourite.updateOne(
      { userId: req.user.id },
      {
        $pull: {
          palette: {
            paletteId: id,
          },
        },
      },
      { new: true, runValidators: true }
    );
    let updatedFavourite = await Favourite.findOne({ userId: req.user.id });
    res.status(200).json({ sucess: true, updatedFavourite });
  } else {
    throw new CustomError("Provided category is incorrect", 400);
  }
});

/******************************************************
 * @Get Get Favourites by User Id
 * @route http://localhost:8000/api/v1/favourite/getFavourite
 * @description Get Favourites by User Id
 * @returns Favourites Object
 ******************************************************/

export const getFavouritesByUserId = asyncHandler(async (req, res) => {
  let favourite = await Favourite.findOne({ userId: req.user.id });
  res.status(200).json({ sucess: true, favourite });
});

export const deleteFavouritesByUserId = asyncHandler(async (req, res) => {
  await Favourite.findOneAndDelete({ userId: req.user.id });
  res
    .status(200)
    .json({ sucess: true, message: "All Favourites Deleted Sucessfully" });
});

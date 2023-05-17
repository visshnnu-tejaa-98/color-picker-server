import mongoose from "mongoose";

const Schema = mongoose.Schema;

const favouritesSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  palette: [
    {
      paletteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Palette",
      },
    },
  ],
  gradients: [
    {
      gradientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gradient",
      },
    },
  ],
});

export default mongoose.model("Favourite", favouritesSchema);

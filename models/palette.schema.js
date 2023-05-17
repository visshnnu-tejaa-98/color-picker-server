import mongoose from "mongoose";

const Schema = mongoose.Schema;

const paletteSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    palette: [
      {
        type: String,
        validate: {
          validator: function (v) {
            var re = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            return !v || !v.trim().length || re.test(v);
          },
          message: "Provided Hex Color Code is invalid.",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Palette", paletteSchema);

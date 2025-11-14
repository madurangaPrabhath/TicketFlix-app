import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound unique index - sparse allows multiple null values
favoriteSchema.index({ userId: 1, movieId: 1 }, { unique: true, sparse: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;

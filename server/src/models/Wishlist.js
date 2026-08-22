const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    medicines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Medicine" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);

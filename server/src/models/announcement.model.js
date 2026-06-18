const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "Announcement message is required"],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;

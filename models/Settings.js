const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    currentToken: {
      type: String,
      default: "--",
    },

    totalServedToday: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Settings",
  settingsSchema
);
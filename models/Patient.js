
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    consultationTime: {
      type: Number,
      required: true,
    },

    remainingTime: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
    },

    estimatedTime: {
      type: Number,
      default: 0,
    },

    isEmergency: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["waiting", "serving", "done"],
      default: "waiting",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Patient",
  patientSchema
);


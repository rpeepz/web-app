const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    ownerHost: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["whole", "private", "bed"], required: true }, // whole house, private room, bed
    description: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    images: [String],
    maxGuests: { type: Number, required: true },
    facilities: [String], // e.g. WiFi, Kitchen, etc.
    category: { type: String }, // e.g. "apartment", "condo", etc.
    latitude: { type: Number },
    longitude: { type: Number },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", PropertySchema);

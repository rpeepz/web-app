const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    ownerHost: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["whole", "private", "bed"], required: true }, // whole house, private room, bed
    //rooms variable, which is an array of objects
    //length of array is equal to number of rooms
    //each object is either a public room or a private room
    //and each room contains an array of labels reflecting the size of bed in that room, and wether it is available or not
    rooms: [
      {
        isPrivate: { type: Boolean, required: true },
        beds: [
          {
            label: { type: String, required: true }, // e.g. "Queen", "Single", etc.
            isAvailable: { type: Boolean, required: true },
          },
        ],
      },
    ],
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

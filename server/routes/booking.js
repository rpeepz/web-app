const express = require("express");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Create a new booking (guest only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Calculate nights and price
    const nights = Math.floor((new Date(endDate).setHours(0,0,0,0) - new Date(startDate).setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return res.status(400).json({ message: "Invalid date range" });
    const totalPrice = nights * property.pricePerNight;

    // Prevent double booking (basic example; can make more robust)
    const overlapping = await Booking.findOne({
      property: propertyId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });
    if (overlapping) return res.status(409).json({ message: "Property already booked for those dates" });

    // Create booking
    const booking = new Booking({
      property: propertyId,
      guest: req.user.id,
      host: property.ownerHost,
      startDate, endDate, totalPrice
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Booking failed", error: error.message });
  }
});

// Get all bookings for the user (guest's trip list)
router.get("/guest", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user.id })
      .populate("property")
      .sort("-startDate");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
});

// Get all bookings for host's properties (host-only)
router.get("/host", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ host: req.user.id })
      .populate("property guest")
      .sort("-startDate");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
});

module.exports = router;

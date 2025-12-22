const User = require("../models/User");
const express = require("express");
const multer = require("multer");
const path = require("path");
const Property = require("../models/Property");
const verifyToken = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, "public/uploads"); },
  filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage });

// Create property (Host only)
router.post("/", verifyToken, upload.array("images", 6), async (req, res) => {
  try {
    const { title, type, description, pricePerNight, address, maxGuests, facilities, category, city, country } = req.body;
    const imagePaths = req.files?.map(file => `/uploads/${file.filename}`) || [];
    const property = new Property({
      ownerHost: req.user.id,
      title, type, description, pricePerNight, address, maxGuests,
      facilities: facilities ? facilities.split(",") : [],
      category,
      city,
      country,
      images: imagePaths,
    });
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: "Property creation failed", error: error.message });
  }
});

// Get all properties (for guests)
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().populate("ownerHost", "firstName lastName profileImagePath");
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
});

// Get properties of logged-in host
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const properties = await Property.find({ ownerHost: req.user.id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your properties" });
  }
});


// Get property details
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("ownerHost", "firstName lastName profileImagePath");
    res.json(property);
  } catch (error) {
    res.status(404).json({ message: "Property not found" });
  }
});

// Add to wishlist
router.post("/:id/wishlist", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { wishList: req.params.id } }
    );
    res.json({ message: "Added to wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update wishlist", error: error.message });
  }
});

  
  // Remove from wishlist
  router.delete("/:id/wishlist", verifyToken, async (req, res) => {
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { wishList: req.params.id } }
    );
    res.json({ message: "Removed from wishlist" });
  });
  
  router.get("/mine", verifyToken, async (req, res) => {
    console.log("req.user");
    try {
      const properties = await Property.find({ ownerHost: req.user.id });
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your properties" });
    }
  });

// Update/Delete property routes (for hosts, omitted for brevity but use verifyToken and author-only checks)

module.exports = router;

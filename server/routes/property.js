const User = require("../models/User");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fetch = require("node-fetch");
const Property = require("../models/Property");
const verifyToken = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, "public/uploads"); },
  filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage });

// Helper function to geocode an address
const geocodeAddress = async (address) => {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', address);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'property-rental-platform/1.0'
      }
    });
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
  } catch (err) {
    console.error('Geocoding error:', err);
  }
  return null;
};

// Create property (Host only)
router.post("/", verifyToken, upload.array("images", 6), async (req, res) => {
  try {
    const { title, type, description, pricePerNight, address, maxGuests, facilities, category, city, country, rooms } = req.body;
    const images = req.files?.map(file => ({
      path: `/uploads/${file.filename}`,
      caption: ""
    })) || [];
    
    // Parse rooms from JSON string
    let parsedRooms = [];
    if (rooms) {
      try {
        parsedRooms = JSON.parse(rooms);
      } catch (e) {
        return res.status(400).json({ message: "Invalid rooms format" });
      }
    }

    // Geocode the address to get latitude and longitude
    let latitude, longitude;
    if (address) {
      const coords = await geocodeAddress(`${address}, ${city}, ${country}`);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
    }

    // Property is only active if it has rooms configured
    const isActive = parsedRooms.length > 0;

    const property = new Property({
      ownerHost: req.user.id,
      title,
      type,
      description,
      pricePerNight,
      address,
      maxGuests,
      facilities: facilities ? facilities.split(",") : [],
      category,
      city,
      country,
      images,
      rooms: parsedRooms,
      latitude,
      longitude,
      isActive,
    });
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: "Property creation failed", error: error.message });
  }
});

// Get all properties (for guests) - only show active properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find({ isActive: true }).populate("ownerHost", "firstName lastName profileImagePath");
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

// Update property (Host only - verify ownership)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    // Verify ownership
    if (property.ownerHost.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own properties" });
    }

    // Prevent changing the type after creation
    if (req.body.type && req.body.type !== property.type) {
      return res.status(400).json({ message: "Property type cannot be changed after creation" });
    }

    // Update fields
    const { title, description, pricePerNight, maxGuests, facilities, category, isActive, rooms } = req.body;
    
    if (title) property.title = title;
    if (description) property.description = description;
    if (pricePerNight !== undefined) property.pricePerNight = pricePerNight;
    if (maxGuests !== undefined) property.maxGuests = maxGuests;
    if (facilities) property.facilities = typeof facilities === "string" ? facilities.split(",") : facilities;
    if (category) property.category = category;
    if (rooms) property.rooms = rooms;
    
    // Handle isActive - can only activate if rooms are configured
    if (isActive !== undefined) {
      if (isActive && property.rooms.length === 0) {
        return res.status(400).json({ message: "Cannot activate property without rooms configured" });
      }
      property.isActive = isActive;
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Failed to update property", error: error.message });
  }
});

// Delete property (Host only - verify ownership)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    // Verify ownership
    if (property.ownerHost.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own properties" });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete property", error: error.message });
  }
});

// Update image caption (Host only - verify ownership)
router.put("/:id/images/:imageIndex", verifyToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    // Verify ownership
    if (property.ownerHost.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own properties" });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    const { caption } = req.body;

    if (imageIndex < 0 || imageIndex >= property.images.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    property.images[imageIndex].caption = caption || "";
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Failed to update image caption", error: error.message });
  }
});

// Delete image (Host only - verify ownership)
router.delete("/:id/images/:imageIndex", verifyToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    // Verify ownership
    if (property.ownerHost.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own properties" });
    }

    const imageIndex = parseInt(req.params.imageIndex);

    if (imageIndex < 0 || imageIndex >= property.images.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    property.images.splice(imageIndex, 1);
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image", error: error.message });
  }
});

// Add images to existing property (Host only - verify ownership)
router.post("/:id/images", verifyToken, upload.array("images", 6), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    // Verify ownership
    if (property.ownerHost.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own properties" });
    }

    // Check total image count
    const totalImages = (property.images?.length || 0) + (req.files?.length || 0);
    if (totalImages > 6) {
      return res.status(400).json({ message: "Maximum 6 images allowed per property" });
    }

    const newImages = req.files?.map(file => ({
      path: `/uploads/${file.filename}`,
      caption: ""
    })) || [];

    property.images = [...(property.images || []), ...newImages];
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Failed to upload images", error: error.message });
  }
});

module.exports = router;

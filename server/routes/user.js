// const express = require("express");
// const User = require("../models/User");
// const Property = require("../models/Property");
// const verifyToken = require("../middleware/auth");
// const router = express.Router();

// // Toggle wishlist property
// router.post("/wishlist/:propertyId", verifyToken, async (req, res) => {
//   const user = await User.findById(req.user.id);
//   const { propertyId } = req.params;

//   const idx = user.wishList.indexOf(propertyId);
//   if (idx === -1) user.wishList.push(propertyId);
//   else user.wishList.splice(idx, 1);

//   await user.save();
//   res.json(user.wishList);
// });

// // Get wishlist
// router.get("/wishlist", verifyToken, async (req, res) => {
//   const user = await User.findById(req.user.id).populate("wishList");
//   res.json(user.wishList);
// });

// module.exports = router;

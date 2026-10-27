
const express = require("express");

const {
  protect
} = require("../middleware/authMiddleware");

const {
  getProfile,
  saveProfile
} = require("../controllers/profileController");

/*
========================================
FITVERSE AI — STUDENT PROFILE ROUTES
========================================
*/

const router = express.Router();

/*
========================================
PROTECT ALL PROFILE ROUTES
========================================
*/

// Every request must have a valid JWT.
// The middleware also verifies that the
// student account exists and is active.
router.use(protect);

/*
========================================
GET STUDENT PROFILE
GET /api/profile
========================================
*/

// Retrieve the currently logged-in
// student's profile from MongoDB.
router.get("/", getProfile);

/*
========================================
SAVE STUDENT PROFILE
PUT /api/profile
========================================
*/

// Create or update the currently logged-in
// student's profile in MongoDB.
router.put("/", saveProfile);

/*
========================================
EXPORT PROFILE ROUTER
========================================
*/

module.exports = router;


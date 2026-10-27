
const express = require("express");

const {
  getAdaptiveProgress,
  saveAdaptiveProgress
} = require("../controllers/adaptiveProgressController");

const {
  protect
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
========================================
FITVERSE AI — ADAPTIVE PROGRESS ROUTES
========================================
*/

// All routes require a logged-in user.
router.use(protect);

// Load adaptive workout progress.
router.get("/", getAdaptiveProgress);

// Save adaptive workout progress.
router.put("/", saveAdaptiveProgress);

module.exports = router;

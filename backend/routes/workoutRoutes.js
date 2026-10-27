
const express = require("express");

const {
  saveWorkout,
  getWorkouts
} = require("../controllers/workoutController");

const {
  protect
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
========================================
FITVERSE AI — WORKOUT ROUTES
========================================
*/

// Require a valid JWT for every workout route
router.use(protect);

/*
GET /api/workouts
Retrieve the logged-in student's
completed workout history
*/
router.get("/", getWorkouts);

/*
POST /api/workouts
Save a completed workout for the
currently logged-in student
*/
router.post("/", saveWorkout);

/*
========================================
EXPORT ROUTER
========================================
*/

module.exports = router;

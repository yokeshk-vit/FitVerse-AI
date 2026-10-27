
const StudentProfile = require("../models/StudentProfile");

/*
========================================
FITVERSE AI — STUDENT PROFILE CONTROLLER
========================================
*/

// Fields students are allowed to update
const allowedFields = [
  "name",
  "department",
  "hostel",
  "messType",
  "workoutLevel",
  "fitnessGoal",
  "workoutDuration",
  "height",
  "weight"
];

const textLimits = {
  name: 80,
  department: 100,
  hostel: 100,
  messType: 50,
  workoutLevel: 50,
  fitnessGoal: 100
};

const numericLimits = {
  workoutDuration: 240,
  height: 300,
  weight: 500
};

/*
========================================
GET MY PROFILE
GET /api/profile
========================================
*/

async function getProfile(req, res) {
  try {
    const profile = await StudentProfile.findOne({
      user: req.user._id
    });

    return res.status(200).json({
      success: true,
      profile: profile || null
    });

  } catch (error) {
    console.error("Get profile error:", error.name);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile"
    });
  }
}

/*
========================================
CREATE OR UPDATE MY PROFILE
PUT /api/profile
========================================
*/

async function saveProfile(req, res) {
  try {
    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid profile object is required"
      });
    }

    const updates = {};

    // Only accept explicitly permitted fields
    for (const field of allowedFields) {
      if (!Object.prototype.hasOwnProperty.call(body, field)) {
        continue;
      }

      const value = body[field];

      // Validate text fields
      if (Object.prototype.hasOwnProperty.call(textLimits, field)) {
        if (
          typeof value !== "string" ||
          value.trim().length > textLimits[field]
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for ${field}`
          });
        }

        updates[field] = value.trim();
        continue;
      }

      // Validate optional numeric fields
      if (Object.prototype.hasOwnProperty.call(numericLimits, field)) {
        if (value === null || value === "") {
          updates[field] = null;
          continue;
        }

        const number = Number(value);

        if (
          (typeof value !== "number" &&
            typeof value !== "string") ||
          (typeof value === "string" &&
            value.trim() === "") ||
          !Number.isFinite(number) ||
          number < 0 ||
          number > numericLimits[field]
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for ${field}`
          });
        }

        updates[field] = number;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile fields provided"
      });
    }

    // The authenticated user ID always comes from
    // JWT middleware, never from the request body.
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: updates,
        $setOnInsert: {
          user: req.user._id
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      profile
    });

  } catch (error) {
    console.error("Save profile error:", error.name);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Profile update conflict. Please retry."
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile information"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save profile"
    });
  }
}

/*
========================================
EXPORT CONTROLLER
========================================
*/

module.exports = {
  getProfile,
  saveProfile
};

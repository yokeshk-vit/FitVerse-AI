
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

/*
========================================
FITVERSE AI — JWT AUTH MIDDLEWARE
========================================
*/

async function protect(req, res, next) {
  try {
    // Read the Authorization header
    const authorization = req.headers.authorization;

    if (
      typeof authorization !== "string" ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Extract the JWT token
    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing"
      });
    }

    // Verify the JWT signature and expiration
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"]
      }
    );

    // Validate the user ID inside the token
    if (
      !decoded.userId ||
      !mongoose.isValidObjectId(decoded.userId)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
    }

    // Find the authenticated user
    const user = await User.findById(
      decoded.userId
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is unavailable"
      });
    }

    // Make the authenticated user available
    // to the next controller
    req.user = user;

    next();

  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token"
      });
    }

    console.error(
      "Authentication middleware error:",
      error.name
    );

    return res.status(500).json({
      success: false,
      message: "Authentication verification failed"
    });
  }
}

/*
========================================
EXPORT MIDDLEWARE
========================================
*/

module.exports = {
  protect
};

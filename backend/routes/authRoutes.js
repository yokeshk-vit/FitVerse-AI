
const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login
} = require("../controllers/authController");

const {
  protect
} = require("../middleware/authMiddleware");

/*
========================================
FITVERSE AI — AUTHENTICATION ROUTES
========================================
*/

const router = express.Router();

/*
========================================
AUTHENTICATION RATE LIMITER
========================================
*/

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication requests. Please try again later."
  }
});

/*
========================================
REGISTER STUDENT
POST /api/auth/register
========================================
*/

router.post("/register", authLimiter, register);

/*
========================================
LOGIN STUDENT
POST /api/auth/login
========================================
*/

router.post("/login", authLimiter, login);

/*
========================================
GET CURRENT LOGGED-IN STUDENT
GET /api/auth/me
========================================
*/

router.get("/me", protect, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authenticated student retrieved",
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

/*
========================================
EXPORT ROUTER
========================================
*/

module.exports = router;

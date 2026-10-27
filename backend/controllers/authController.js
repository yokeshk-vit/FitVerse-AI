
const User = require("../models/User");
const jwt = require("jsonwebtoken");

/*
========================================
FITVERSE AI — AUTHENTICATION CONTROLLER
========================================
*/

// Generate a signed authentication token
function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1h", algorithm: "HS256" }
  );
}

// Return safe user information
function formatUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

/*
========================================
REGISTER NEW STUDENT
========================================
*/

async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 2 to 80 characters"
      });
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address"
      });
    }

    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and at most 72 UTF-8 bytes"
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    // Only student accounts can be created publicly.
    // Never accept a role from the request body.
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: "student"
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: formatUser(user),
      token
    });

  } catch (error) {
    // A unique index also protects against simultaneous registrations.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    console.error("Registration failed:", error.name);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
}

/*
========================================
LOGIN EXISTING STUDENT
========================================
*/

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail
    }).select("+password");

    if (
      !user ||
      !user.isActive ||
      !(await user.comparePassword(password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: formatUser(user),
      token
    });

  } catch (error) {
    console.error("Login failed:", error.name);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again."
    });
  }
}

module.exports = {
  register,
  login
};

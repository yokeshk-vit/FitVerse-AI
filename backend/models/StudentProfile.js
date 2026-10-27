
const mongoose = require("mongoose");

/*
========================================
FITVERSE AI — STUDENT PROFILE MODEL
========================================
*/

const studentProfileSchema = new mongoose.Schema(
  {
    // Each profile belongs to one registered user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true
    },

    name: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },

    department: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },

    hostel: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },

    messType: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ""
    },

    workoutLevel: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ""
    },

    fitnessGoal: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },

    workoutDuration: {
      type: Number,
      min: 0,
      max: 240,
      default: null
    },

    height: {
      type: Number,
      min: 0,
      max: 300,
      default: null
    },

    weight: {
      type: Number,
      min: 0,
      max: 500,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/*
========================================
DATABASE INDEX
========================================
*/

// unique: true on the user field ensures
// one profile per registered account.

/*
========================================
SAFE JSON OUTPUT
========================================
*/

studentProfileSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

/*
========================================
EXPORT PROFILE MODEL
========================================
*/

module.exports = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);

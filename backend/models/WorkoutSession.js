
const mongoose = require("mongoose");

/*
========================================
FITVERSE AI — WORKOUT SESSION MODEL
========================================
*/

// Individual exercise completed in a session
const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    sets: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    reps: {
      type: Number,
      min: 0,
      max: 1000,
      default: 0
    },

    durationSeconds: {
      type: Number,
      min: 0,
      max: 86400,
      default: 0
    },

    completed: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: false
  }
);

/*
========================================
WORKOUT SESSION SCHEMA
========================================
*/

const workoutSessionSchema = new mongoose.Schema(
  {
    // The authenticated student who owns
    // this workout session
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true
    },

    workoutName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    workoutType: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "General Fitness"
    },

    difficulty: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced"
      ],
      default: "Beginner"
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 0,
      max: 300
    },

    exercises: {
      type: [exerciseSchema],
      default: [],
      validate: {
        validator: function (value) {
          return value.length <= 100;
        },
        message: "Too many exercises in one session"
      }
    },

    completedAt: {
      type: Date,
      default: Date.now
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
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

// Efficiently retrieve a student's
// most recent completed workouts
workoutSessionSchema.index({
  user: 1,
  completedAt: -1
});

/*
========================================
SAFE JSON OUTPUT
========================================
*/

workoutSessionSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

/*
========================================
EXPORT WORKOUT SESSION MODEL
========================================
*/

module.exports = mongoose.model(
  "WorkoutSession",
  workoutSessionSchema
);

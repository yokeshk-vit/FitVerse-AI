
const mongoose = require("mongoose");

const LEVEL_GROUPS = [
  "push",
  "squat",
  "core",
  "cardio",
  "glutes"
];

const levelSchema = new mongoose.Schema(
  {
    push: {
      type: Number,
      min: 1,
      max: 4,
      default: 1
    },
    squat: {
      type: Number,
      min: 1,
      max: 4,
      default: 1
    },
    core: {
      type: Number,
      min: 1,
      max: 4,
      default: 1
    },
    cardio: {
      type: Number,
      min: 1,
      max: 4,
      default: 1
    },
    glutes: {
      type: Number,
      min: 1,
      max: 4,
      default: 1
    }
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      maxlength: 100
    },

    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },

    effort: {
      type: String,
      enum: ["easy", "manageable", "hard"],
      required: true
    },

    technique: {
      type: String,
      enum: ["confident", "unsure"],
      required: true
    },

    recovery: {
      type: String,
      enum: ["good", "tired", "discomfort"],
      required: true
    },

    completedGroups: {
      type: [
        {
          type: String,
          enum: LEVEL_GROUPS
        }
      ],
      default: []
    },

    levelsAtCompletion: {
      type: levelSchema,
      default: () => ({})
    }
  },
  { _id: false }
);

const adaptiveProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    levels: {
      type: levelSchema,
      default: () => ({})
    },

    sessions: {
      type: [sessionSchema],
      default: [],
      validate: {
        validator: value => value.length <= 200,
        message: "Maximum 200 adaptive sessions allowed."
      }
    },

    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "AdaptiveProgress",
  adaptiveProgressSchema
);

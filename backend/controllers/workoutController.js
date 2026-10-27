
const WorkoutSession = require("../models/WorkoutSession");

/*
========================================
FITVERSE AI — WORKOUT CONTROLLER
========================================
*/

const allowedFields = [
  "workoutName",
  "workoutType",
  "difficulty",
  "durationMinutes",
  "exercises",
  "completedAt",
  "notes"
];

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

/*
========================================
SAVE COMPLETED WORKOUT
POST /api/workouts
========================================
*/

const saveWorkout = async (req, res) => {
  try {
    const body = req.body;

    if (!isPlainObject(body)) {
      return res.status(400).json({
        success: false,
        message: "A valid workout object is required"
      });
    }

    // Reject fields that clients must not control,
    // including user ownership and MongoDB IDs.
    const unknownFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Unsupported workout fields"
      });
    }

    if (
      typeof body.workoutName !== "string" ||
      !body.workoutName.trim() ||
      body.workoutName.trim().length > 120
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid workout name is required"
      });
    }

    if (
      typeof body.durationMinutes !== "number" ||
      !Number.isFinite(body.durationMinutes) ||
      body.durationMinutes < 0 ||
      body.durationMinutes > 300
    ) {
      return res.status(400).json({
        success: false,
        message: "Workout duration must be between 0 and 300 minutes"
      });
    }

    if (
      body.workoutType !== undefined &&
      (
        typeof body.workoutType !== "string" ||
        body.workoutType.length > 80
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid workout type"
      });
    }

    const validDifficulties = [
      "Beginner",
      "Intermediate",
      "Advanced"
    ];

    if (
      body.difficulty !== undefined &&
      !validDifficulties.includes(body.difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid workout difficulty"
      });
    }

    if (
      body.notes !== undefined &&
      (
        typeof body.notes !== "string" ||
        body.notes.length > 1000
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid workout notes"
      });
    }

    if (
      body.exercises !== undefined &&
      (
        !Array.isArray(body.exercises) ||
        body.exercises.length > 100
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid exercise list"
      });
    }

    if (body.exercises !== undefined) {
      const validExerciseFields = [
        "name",
        "sets",
        "reps",
        "durationSeconds",
        "completed"
      ];

      for (const exercise of body.exercises) {
        if (
          !isPlainObject(exercise) ||
          Object.keys(exercise).some(
            (key) => !validExerciseFields.includes(key)
          ) ||
          typeof exercise.name !== "string" ||
          !exercise.name.trim() ||
          exercise.name.trim().length > 100
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid exercise information"
          });
        }

        for (const [field, maximum] of [
          ["sets", 100],
          ["reps", 1000],
          ["durationSeconds", 86400]
        ]) {
          if (
            exercise[field] !== undefined &&
            (
              typeof exercise[field] !== "number" ||
              !Number.isFinite(exercise[field]) ||
              !Number.isInteger(exercise[field]) ||
              exercise[field] < 0 ||
              exercise[field] > maximum
            )
          ) {
            return res.status(400).json({
              success: false,
              message: `Invalid exercise ${field}`
            });
          }
        }

        if (
          exercise.completed !== undefined &&
          typeof exercise.completed !== "boolean"
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid exercise completion status"
          });
        }
      }
    }

    if (body.completedAt !== undefined) {
      if (
        typeof body.completedAt !== "string" ||
        !Number.isFinite(Date.parse(body.completedAt))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid completion date"
        });
      }

      const completedTime = Date.parse(body.completedAt);

      if (completedTime > Date.now() + 60000) {
        return res.status(400).json({
          success: false,
          message: "Completion date cannot be in the future"
        });
      }
    }

    // Ownership comes exclusively from the verified JWT.
    const workoutData = {
      user: req.user._id,
      workoutName: body.workoutName.trim(),
      durationMinutes: body.durationMinutes
    };

    for (const field of allowedFields) {
      if (
        field !== "workoutName" &&
        field !== "durationMinutes" &&
        body[field] !== undefined
      ) {
        workoutData[field] = body[field];
      }
    }

    const workout = await WorkoutSession.create(workoutData);

    return res.status(201).json({
      success: true,
      message: "Workout saved successfully",
      workout
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid workout data"
      });
    }

    console.error("Save workout error:", error.name);

    return res.status(500).json({
      success: false,
      message: "Unable to save workout"
    });
  }
};

/*
========================================
GET WORKOUT HISTORY
GET /api/workouts
========================================
*/

const getWorkouts = async (req, res) => {
  try {
    // A student can only retrieve their own workouts.
    const workouts = await WorkoutSession.find({
      user: req.user._id
    })
      .sort({ completedAt: -1, _id: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      count: workouts.length,
      workouts
    });
  } catch (error) {
    console.error("Get workouts error:", error.name);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve workout history"
    });
  }
};

/*
========================================
EXPORT CONTROLLER FUNCTIONS
========================================
*/

module.exports = {
  saveWorkout,
  getWorkouts
};

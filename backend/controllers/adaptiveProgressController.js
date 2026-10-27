
const AdaptiveProgress = require("../models/AdaptiveProgress");

/*
========================================
FITVERSE AI — ADAPTIVE PROGRESS CONTROLLER
========================================
*/

const GROUPS = [
  "push",
  "squat",
  "core",
  "cardio",
  "glutes"
];

const VALID_EFFORTS = [
  "easy",
  "manageable",
  "hard"
];

const VALID_TECHNIQUES = [
  "confident",
  "unsure"
];

const VALID_RECOVERY = [
  "good",
  "tired",
  "discomfort"
];

function defaultLevels() {
  return {
    push: 1,
    squat: 1,
    core: 1,
    cardio: 1,
    glutes: 1
  };
}

function defaultProgress() {
  return {
    levels: defaultLevels(),
    sessions: [],
    lastUpdated: null
  };
}

function validateLevels(levels) {
  if (
    !levels ||
    typeof levels !== "object" ||
    Array.isArray(levels)
  ) {
    return false;
  }

  return GROUPS.every(group => {
    const level = levels[group];

    return (
      Number.isInteger(level) &&
      level >= 1 &&
      level <= 4
    );
  });
}

function validateSessions(sessions) {
  if (
    !Array.isArray(sessions) ||
    sessions.length > 200
  ) {
    return false;
  }

  const seenIds = new Set();

  return sessions.every(session => {
    if (
      !session ||
      typeof session !== "object" ||
      Array.isArray(session)
    ) {
      return false;
    }

    if (
      typeof session.id !== "string" ||
      session.id.length === 0 ||
      session.id.length > 100 ||
      seenIds.has(session.id)
    ) {
      return false;
    }

    seenIds.add(session.id);

    if (
      typeof session.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(session.date)
    ) {
      return false;
    }

    if (
      !VALID_EFFORTS.includes(session.effort) ||
      !VALID_TECHNIQUES.includes(session.technique) ||
      !VALID_RECOVERY.includes(session.recovery)
    ) {
      return false;
    }

    if (
      !Array.isArray(session.completedGroups) ||
      !session.completedGroups.every(group =>
        GROUPS.includes(group)
      )
    ) {
      return false;
    }

    return validateLevels(
      session.levelsAtCompletion
    );
  });
}

/*
========================================
GET ADAPTIVE PROGRESS
GET /api/adaptive-progress
========================================
*/

async function getAdaptiveProgress(req, res) {
  try {
    const progress = await AdaptiveProgress.findOne({
      user: req.user._id
    }).lean();

    if (!progress) {
      return res.status(200).json({
        success: true,
        progress: defaultProgress()
      });
    }

    return res.status(200).json({
      success: true,
      progress: {
        levels: progress.levels,
        sessions: progress.sessions,
        lastUpdated: progress.lastUpdated
      }
    });

  } catch (error) {
    console.error(
      "Get adaptive progress error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load adaptive progress"
    });
  }
}

/*
========================================
SAVE ADAPTIVE PROGRESS
PUT /api/adaptive-progress
========================================
*/

async function saveAdaptiveProgress(req, res) {
  try {
    const { levels, sessions } = req.body;

    if (!validateLevels(levels)) {
      return res.status(400).json({
        success: false,
        message: "Invalid training levels"
      });
    }

    if (!validateSessions(sessions)) {
      return res.status(400).json({
        success: false,
        message: "Invalid adaptive workout sessions"
      });
    }

    const progress = await AdaptiveProgress.findOneAndUpdate(
      {
        user: req.user._id
      },
      {
        $set: {
          levels,
          sessions,
          lastUpdated: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Adaptive progress saved successfully",
      progress: {
        levels: progress.levels,
        sessions: progress.sessions,
        lastUpdated: progress.lastUpdated
      }
    });

  } catch (error) {
    console.error(
      "Save adaptive progress error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to save adaptive progress"
    });
  }
}

module.exports = {
  getAdaptiveProgress,
  saveAdaptiveProgress
};


/*
  FITVERSE AI
  Adaptive Workout Progression Engine

  Features:
  - Personalized training levels
  - Daily workout variation
  - Workout session history
  - Recovery-aware progression suggestions
  - Optional student-approved upgrades
  - Browser localStorage persistence
*/

const STORAGE_KEY = "fitverse-adaptive-training-v1";

export const TRAINING_LEVELS = [
  {
    id: 1,
    name: "Foundation",
    description: "Develop technique and movement confidence.",
    icon: "🌱"
  },
  {
    id: 2,
    name: "Developing",
    description: "Explore more challenging exercise variations.",
    icon: "⚡"
  },
  {
    id: 3,
    name: "Skilled",
    description: "Build strength, control and coordination.",
    icon: "🔥"
  },
  {
    id: 4,
    name: "Advanced",
    description: "Practice advanced variations when appropriate.",
    icon: "🏆"
  }
];

// Exercises progress through variations rather than
// forcing every movement to become harder at once.

export const EXERCISE_PROGRESSIONS = {
  push: [
    {
      id: "wallPushup",
      name: "Wall Push-ups",
      reps: "6–10 comfortable repetitions"
    },
    {
      id: "inclinePushup",
      name: "Incline Push-ups",
      reps: "6–10 comfortable repetitions"
    },
    {
      id: "standardPushup",
      name: "Standard Push-ups",
      reps: "5–8 comfortable repetitions"
    },
    {
      id: "tempoPushup",
      name: "Slow Tempo Push-ups",
      reps: "5–8 controlled repetitions"
    }
  ],

  squat: [
    {
      id: "chairSquat",
      name: "Chair Squats",
      reps: "8 comfortable repetitions"
    },
    {
      id: "bodyweightSquat",
      name: "Bodyweight Squats",
      reps: "8–12 comfortable repetitions"
    },
    {
      id: "splitSquat",
      name: "Supported Split Squats",
      reps: "6–8 repetitions per side"
    },
    {
      id: "reverseLunge",
      name: "Controlled Reverse Lunges",
      reps: "6–8 repetitions per side"
    }
  ],

  core: [
    {
      id: "deadBug",
      name: "Dead Bug",
      reps: "6 repetitions per side"
    },
    {
      id: "kneePlank",
      name: "Knee Plank",
      reps: "15–20 seconds"
    },
    {
      id: "forearmPlank",
      name: "Forearm Plank",
      reps: "15–25 seconds"
    },
    {
      id: "sidePlank",
      name: "Side Plank",
      reps: "15–20 seconds per side"
    }
  ],

  cardio: [
    {
      id: "stepJacks",
      name: "Step Jacks",
      reps: "20–30 seconds"
    },
    {
      id: "jumpingJacks",
      name: "Jumping Jacks",
      reps: "20–30 seconds"
    },
    {
      id: "controlledMountainClimbers",
      name: "Controlled Mountain Climbers",
      reps: "15–20 seconds"
    },
    {
      id: "intervalCircuit",
      name: "Adaptable Cardio Intervals",
      reps: "Short intervals with comfortable recovery"
    }
  ],

  glutes: [
    {
      id: "gluteBridge",
      name: "Glute Bridges",
      reps: "8–12 comfortable repetitions"
    },
    {
      id: "bridgeHold",
      name: "Glute Bridge Hold",
      reps: "15–20 seconds"
    },
    {
      id: "staggeredBridge",
      name: "Staggered-Stance Glute Bridge",
      reps: "6–8 repetitions per side"
    },
    {
      id: "singleLegBridge",
      name: "Single-Leg Glute Bridge",
      reps: "5–8 repetitions per side"
    }
  ]
};

// Weekly training structure.
// Students can take additional recovery days.

export const DAILY_TRAINING_SPLIT = [
  {
    day: "Monday",
    title: "Upper Body & Core",
    focus: "Push strength and core stability",
    groups: ["push", "core"],
    type: "training"
  },
  {
    day: "Tuesday",
    title: "Lower Body Strength",
    focus: "Legs and glutes",
    groups: ["squat", "glutes"],
    type: "training"
  },
  {
    day: "Wednesday",
    title: "Cardio Conditioning",
    focus: "Cardiovascular fitness",
    groups: ["cardio", "core"],
    type: "training"
  },
  {
    day: "Thursday",
    title: "Recovery & Mobility",
    focus: "Comfortable movement and recovery",
    groups: [],
    type: "recovery"
  },
  {
    day: "Friday",
    title: "Full Body Strength",
    focus: "Upper and lower body",
    groups: ["push", "squat", "glutes"],
    type: "training"
  },
  {
    day: "Saturday",
    title: "Core & Conditioning",
    focus: "Core stability and cardio",
    groups: ["core", "cardio"],
    type: "training"
  },
  {
    day: "Sunday",
    title: "Rest & Recovery",
    focus: "Rest or optional comfortable activity",
    groups: [],
    type: "recovery"
  }
];

function createDefaultState() {
  return {
    levels: {
      push: 1,
      squat: 1,
      core: 1,
      cardio: 1,
      glutes: 1
    },
    sessions: [],
    lastUpdated: null
  };
}

function validLevel(value) {
  return Number.isInteger(value) &&
    value >= 1 &&
    value <= TRAINING_LEVELS.length;
}

export function loadTrainingState() {
  const fallback = createDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return fallback;

    const saved = JSON.parse(raw);

    if (!saved || typeof saved !== "object") {
      return fallback;
    }

    const levels = { ...fallback.levels };

    Object.keys(levels).forEach(group => {
      if (validLevel(saved.levels?.[group])) {
        levels[group] = saved.levels[group];
      }
    });

    return {
      levels,
      sessions: Array.isArray(saved.sessions)
        ? saved.sessions.filter(
            session =>
              session &&
              typeof session === "object" &&
              typeof session.date === "string"
          ).slice(-200)
        : [],
      lastUpdated: saved.lastUpdated || null
    };
  } catch {
    return fallback;
  }
}

export function saveTrainingState(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

    return true;
  } catch {
    return false;
  }
}

export function getExerciseForLevel(group, level) {
  const progression = EXERCISE_PROGRESSIONS[group];

  if (!progression) return null;

  const safeLevel = validLevel(level) ? level : 1;

  return progression[safeLevel - 1];
}

export function getDailyWorkout(
  date = new Date(),
  state = loadTrainingState()
) {
  const dayIndex = date.getDay();
  const mondayIndex = (dayIndex + 6) % 7;

  const plan = DAILY_TRAINING_SPLIT[mondayIndex];

  const exercises = plan.groups
    .map(group => {
      const level = state.levels?.[group] || 1;
      const exercise = getExerciseForLevel(group, level);

      if (!exercise) return null;

      return {
        ...exercise,
        group,
        level
      };
    })
    .filter(Boolean);

  return {
    ...plan,
    exercises,
    date: [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-")
  };
}

// Feedback:
// effort: easy | manageable | hard
// technique: confident | unsure
// recovery: good | tired | discomfort

export function recordWorkoutSession({
  effort,
  technique,
  recovery,
  completedGroups = [],
  date = new Date()
}) {
  const validEfforts = ["easy", "manageable", "hard"];
  const validTechniques = ["confident", "unsure"];
  const validRecovery = ["good", "tired", "discomfort"];

  if (
    !validEfforts.includes(effort) ||
    !validTechniques.includes(technique) ||
    !validRecovery.includes(recovery)
  ) {
    return {
      success: false,
      message: "Please complete the workout feedback."
    };
  }

  const state = loadTrainingState();

  const groups = [
    ...new Set(completedGroups)
  ].filter(group => group in EXERCISE_PROGRESSIONS);

  if (groups.length === 0) {
    return {
      success: false,
      message: "Select at least one completed exercise."
    };
  }

  const sessionDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");

  const session = {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    date: sessionDate,
    effort,
    technique,
    recovery,
    completedGroups: groups,
    levelsAtCompletion: { ...state.levels }
  };

  const updated = {
    ...state,
    sessions: [...state.sessions, session].slice(-200),
    lastUpdated: new Date().toISOString()
  };

  const saved = saveTrainingState(updated);

  return {
    success: saved,
    message: saved
      ? "Workout session saved successfully."
      : "Unable to save workout progress.",
    session,
    state: updated
  };
}

// Readiness is a conservative suggestion, not
// a medical or physical fitness assessment.
//
// Require repeated feedback across distinct days.
// No upgrade is ever applied automatically.

export function getProgressionRecommendations(
  state = loadTrainingState()
) {
  const recommendations = [];

  Object.keys(EXERCISE_PROGRESSIONS).forEach(group => {
    const currentLevel = state.levels[group] || 1;

    if (currentLevel >= TRAINING_LEVELS.length) {
      return;
    }

    const currentLevelSessions = state.sessions
      .filter(session =>
        session.completedGroups?.includes(group) &&
        session.levelsAtCompletion?.[group] === currentLevel
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    const recentDays = new Set();
    const recentSessions = [];

    for (const session of currentLevelSessions) {
      if (!recentDays.has(session.date)) {
        recentDays.add(session.date);
        recentSessions.push(session);
      }

      if (recentSessions.length === 3) break;
    }

    if (recentSessions.length < 3) {
      return;
    }

    const ready = recentSessions.every(session =>
      ["easy", "manageable"].includes(session.effort) &&
      session.technique === "confident" &&
      session.recovery === "good"
    );

    if (!ready) return;

    recommendations.push({
      group,
      currentLevel,
      nextLevel: currentLevel + 1,
      currentExercise: getExerciseForLevel(
        group,
        currentLevel
      ),
      nextExercise: getExerciseForLevel(
        group,
        currentLevel + 1
      ),
      reason:
        "You reported manageable effort, confident technique and good recovery across three different training days. You may be ready to try the next variation.",
      requiresConfirmation: true
    });
  });

  return recommendations;
}

export function acceptLevelUpgrade(group) {
  const state = loadTrainingState();

  if (!(group in EXERCISE_PROGRESSIONS)) {
    return {
      success: false,
      message: "Unknown exercise category."
    };
  }

  const recommendations =
    getProgressionRecommendations(state);

  const recommendation = recommendations.find(
    item => item.group === group
  );

  if (!recommendation) {
    return {
      success: false,
      message: "No progression suggestion is currently available."
    };
  }

  const updated = {
    ...state,
    levels: {
      ...state.levels,
      [group]: recommendation.nextLevel
    },
    lastUpdated: new Date().toISOString()
  };

  const saved = saveTrainingState(updated);

  return {
    success: saved,
    message: saved
      ? `New ${group} variation unlocked!`
      : "Unable to save the level upgrade.",
    state: updated
  };
}

export function getTrainingSummary(
  state = loadTrainingState()
) {
  const uniqueDates = new Set(
    state.sessions.map(session => session.date)
  );

  const levelValues = Object.values(state.levels);

  return {
    totalSessions: state.sessions.length,
    activeDays: uniqueDates.size,
    averageLevel:
      levelValues.reduce((sum, level) => sum + level, 0) /
      levelValues.length,
    levels: state.levels,
    recommendations:
      getProgressionRecommendations(state)
  };
}

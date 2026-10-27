
/*
  FITVERSE AI 2.1
  Personalized Smart Workout Generator

  Features:
  - Weekly workout plans
  - Adaptive exercise progression
  - Student fitness goal personalization
  - Preferred workout duration
  - Warm-up, main workout and cool-down
  - Recovery day preservation
  - Safe exercise selection
  - Existing dashboard compatibility
*/

import {
  exerciseLibrary,
  weeklyWorkoutPlan
} from "../data/workoutData";

import {
  loadTrainingState
} from "./adaptiveWorkoutEngine";

export const SESSION_DURATIONS = [15, 20, 30];

const PROFILE_STORAGE_KEY =
  "fitverse-student-profile";

const DEFAULT_PROFILE = {
  workoutLevel: "beginner",
  fitnessGoal: "general",
  workoutDuration: "20"
};

const VALID_GOALS = [
  "general",
  "strength",
  "endurance",
  "flexibility"
];

const PROGRESSION_EXERCISES = {
  push: [
    "wallPushups",
    "inclinePushups",
    "pushups",
    "tempoPushups"
  ],

  squat: [
    "chairSquats",
    "squats",
    "splitSquats",
    "reverseLunges"
  ],

  core: [
    "deadBug",
    "kneePlank",
    "plank",
    "sidePlank"
  ],

  cardio: [
    "stepJacks",
    "jumpingJacks",
    "mountainClimbers",
    "cardioIntervals"
  ],

  glutes: [
    "gluteBridge",
    "bridgeHold",
    "staggeredBridge",
    "singleLegBridge"
  ]
};

const GROUP_BY_EXERCISE = Object.fromEntries(
  Object.entries(PROGRESSION_EXERCISES).flatMap(
    ([group, ids]) =>
      ids.map(id => [id, group])
  )
);

const WARMUP_IDS = new Set([
  "marching",
  "armCircles",
  "shoulderRolls",
  "hipCircles",
  "sideSteps"
]);

const COOLDOWN_IDS = new Set([
  "chestStretch",
  "hipFlexorStretch",
  "calfStretch",
  "breathingRecovery"
]);

const GOAL_CONFIG = {
  general: {
    label: "General Fitness",
    focus:
      "Balanced strength, cardio and mobility",
    preferredGroups: [
      "push",
      "squat",
      "core",
      "cardio",
      "glutes"
    ],
    preferredCategories: [],
    keywords: []
  },

  strength: {
    label: "Build Strength",
    focus:
      "Controlled strength and stability movements",
    preferredGroups: [
      "push",
      "squat",
      "core",
      "glutes"
    ],
    preferredCategories: [
      "strength"
    ],
    keywords: [
      "strength",
      "squat",
      "push",
      "bridge",
      "plank",
      "lunge",
      "core"
    ]
  },

  endurance: {
    label: "Improve Endurance",
    focus:
      "Comfortable cardio and stamina development",
    preferredGroups: [
      "cardio"
    ],
    preferredCategories: [
      "cardio"
    ],
    keywords: [
      "cardio",
      "march",
      "step",
      "walk",
      "jack",
      "interval"
    ]
  },

  flexibility: {
    label: "Flexibility & Mobility",
    focus:
      "Gentle mobility and movement quality",
    preferredGroups: [],
    preferredCategories: [
      "mobility",
      "flexibility",
      "stretching"
    ],
    keywords: [
      "stretch",
      "mobility",
      "circle",
      "roll",
      "breathing",
      "recovery"
    ]
  }
};

function clamp(value, minimum, maximum) {
  return Math.max(
    minimum,
    Math.min(maximum, value)
  );
}

function getDayIndex(date) {
  return (date.getDay() + 6) % 7;
}

function loadStudentPreferences() {
  try {
    const saved = localStorage.getItem(
      PROFILE_STORAGE_KEY
    );

    if (!saved) {
      return { ...DEFAULT_PROFILE };
    }

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return { ...DEFAULT_PROFILE };
    }

    return {
      ...DEFAULT_PROFILE,
      ...parsed
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function getWorkoutPreferences() {
  const profile = loadStudentPreferences();

  const fitnessGoal = VALID_GOALS.includes(
    profile.fitnessGoal
  )
    ? profile.fitnessGoal
    : "general";

  const requestedDuration = Number(
    profile.workoutDuration
  );

  const workoutDuration =
    SESSION_DURATIONS.includes(requestedDuration)
      ? requestedDuration
      : 20;

  const workoutLevel =
    profile.workoutLevel === "intermediate"
      ? "intermediate"
      : "beginner";

  return {
    fitnessGoal,
    workoutDuration,
    workoutLevel,
    goalLabel: GOAL_CONFIG[fitnessGoal].label
  };
}

function resolveDuration(
  duration,
  preferredDuration
) {
  if (
    duration !== undefined &&
    duration !== null &&
    SESSION_DURATIONS.includes(Number(duration))
  ) {
    return Number(duration);
  }

  if (
    SESSION_DURATIONS.includes(
      Number(preferredDuration)
    )
  ) {
    return Number(preferredDuration);
  }

  return 20;
}

function resolveExercise(id, levels = {}) {
  const group = GROUP_BY_EXERCISE[id];

  const originalExercise = exerciseLibrary[id];

  if (!group) {
    return originalExercise
      ? {
          ...originalExercise,
          group: null
        }
      : null;
  }

  const level = clamp(
    Number(levels[group]) || 1,
    1,
    4
  );

  const selectedId =
    PROGRESSION_EXERCISES[group][level - 1];

  const selectedExercise =
    exerciseLibrary[selectedId];

  if (!selectedExercise) {
    return originalExercise
      ? {
          ...originalExercise,
          group,
          approvedLevel: level
        }
      : null;
  }

  return {
    ...selectedExercise,
    group,
    approvedLevel: level
  };
}

function createStep(
  exercise,
  phase,
  round = 1
) {
  return {
    id: `${phase}-${exercise.id}-${round}`,
    exerciseId: exercise.id,
    name: exercise.name,
    phase,
    round,
    category: exercise.category,
    muscle: exercise.muscle,
    group: exercise.group || null,
    approvedLevel:
      exercise.approvedLevel ||
      exercise.level,
    duration: exercise.duration,
    rest: exercise.rest,
    instructions: exercise.instructions,
    alternative: exercise.alternative,
    equipment: exercise.equipment,
    icon: exercise.icon
  };
}

function sumSeconds(steps) {
  return steps.reduce(
    (total, step) =>
      total +
      (Number(step.duration) || 0) +
      (Number(step.rest) || 0),
    0
  );
}

function formatMinutes(seconds) {
  return Math.round(seconds / 60);
}

function getExerciseText(exercise) {
  return [
    exercise.id,
    exercise.name,
    exercise.category,
    exercise.muscle,
    exercise.group
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getGoalScore(exercise, goal) {
  const config =
    GOAL_CONFIG[goal] ||
    GOAL_CONFIG.general;

  if (goal === "general") {
    return 1;
  }

  let score = 0;

  if (
    exercise.group &&
    config.preferredGroups.includes(
      exercise.group
    )
  ) {
    score += 5;
  }

  const category = String(
    exercise.category || ""
  ).toLowerCase();

  if (
    config.preferredCategories.some(
      preferred =>
        category.includes(preferred)
    )
  ) {
    score += 4;
  }

  const text = getExerciseText(exercise);

  config.keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 1;
    }
  });

  return score;
}

function personalizeMainExercises(
  exercises,
  goal
) {
  if (
    goal === "general" ||
    exercises.length <= 1
  ) {
    return exercises;
  }

  /*
    Reorder existing exercises instead of
    inserting unknown exercise IDs.

    This preserves compatibility with
    workoutData.js and adaptive levels.
  */

  return exercises
    .map((exercise, index) => ({
      exercise,
      index,
      score: getGoalScore(exercise, goal)
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.index - b.index;
    })
    .map(item => item.exercise);
}

function buildMainWorkout(
  mainExercises,
  availableSeconds
) {
  const mainSteps = [];

  if (
    mainExercises.length === 0 ||
    availableSeconds <= 0
  ) {
    return {
      steps: mainSteps,
      rounds: 0
    };
  }

  let round = 1;

  /*
    Add complete rounds when they fit.

    The first round is kept even if the
    source workout data exceeds the
    requested session duration, matching
    the original generator behavior.
  */

  while (round <= 6) {
    const roundSteps = mainExercises.map(
      exercise =>
        createStep(
          exercise,
          "main",
          round
        )
    );

    const nextRoundSeconds =
      sumSeconds(roundSteps);

    const usedSeconds =
      sumSeconds(mainSteps);

    if (
      round > 1 &&
      usedSeconds + nextRoundSeconds >
        availableSeconds
    ) {
      break;
    }

    mainSteps.push(...roundSteps);

    round += 1;
  }

  return {
    steps: mainSteps,
    rounds: round - 1
  };
}

function createRecoveryWorkout({
  plan,
  exercises,
  selectedDuration,
  preferences
}) {
  const recoverySteps = exercises.map(
    exercise =>
      createStep(
        exercise,
        "recovery"
      )
  );

  const totalSeconds =
    sumSeconds(recoverySteps);

  return {
    day: plan.day,
    title: plan.title,
    focus: plan.focus,
    type: "recovery",

    requestedMinutes:
      selectedDuration,

    estimatedMinutes:
      formatMinutes(totalSeconds),

    exercises: recoverySteps,

    phases: [
      {
        name: "Optional Recovery",
        exercises: recoverySteps
      }
    ],

    totalExercises:
      recoverySteps.length,

    totalSeconds,

    rounds: 1,

    fitnessGoal:
      preferences.fitnessGoal,

    fitnessGoalLabel:
      preferences.goalLabel,

    workoutLevel:
      preferences.workoutLevel,

    personalized: true,

    recommendation:
      "Recovery and gentle movement are part of a balanced fitness routine."
  };
}

export function generateSmartWorkout({
  date = new Date(),
  duration,
  trainingState = loadTrainingState(),
  fitnessGoal
} = {}) {
  const preferences =
    getWorkoutPreferences();

  const selectedGoal =
    VALID_GOALS.includes(fitnessGoal)
      ? fitnessGoal
      : preferences.fitnessGoal;

  const selectedDuration =
    resolveDuration(
      duration,
      preferences.workoutDuration
    );

  const selectedPreferences = {
    ...preferences,
    fitnessGoal: selectedGoal,
    goalLabel:
      GOAL_CONFIG[selectedGoal].label
  };

  const dayIndex =
    getDayIndex(date);

  const plan =
    weeklyWorkoutPlan[dayIndex];

  if (!plan) {
    throw new Error(
      "Workout plan not found."
    );
  }

  const levels =
    trainingState?.levels || {};

  const baseExercises =
    plan.exerciseIds
      .map(id =>
        resolveExercise(
          id,
          levels
        )
      )
      .filter(
        exercise =>
          exercise &&
          exercise.id
      );

  /*
    Recovery days stay recovery days
    regardless of the fitness goal.
  */

  if (plan.type === "recovery") {
    return createRecoveryWorkout({
      plan,
      exercises: baseExercises,
      selectedDuration,
      preferences:
        selectedPreferences
    });
  }

  const warmupExercises =
    baseExercises.filter(
      exercise =>
        WARMUP_IDS.has(exercise.id)
    );

  const cooldownExercises =
    baseExercises.filter(
      exercise =>
        COOLDOWN_IDS.has(exercise.id)
    );

  const mainExercises =
    baseExercises.filter(
      exercise =>
        !WARMUP_IDS.has(
          exercise.id
        ) &&
        !COOLDOWN_IDS.has(
          exercise.id
        )
    );

  /*
    Prioritize exercises according to
    the selected fitness goal.
  */

  const personalizedMainExercises =
    personalizeMainExercises(
      mainExercises,
      selectedGoal
    );

  const targetSeconds =
    selectedDuration * 60;

  const warmupSteps =
    warmupExercises.map(
      exercise =>
        createStep(
          exercise,
          "warmup"
        )
    );

  const cooldownSteps =
    cooldownExercises.map(
      exercise =>
        createStep(
          exercise,
          "cooldown"
        )
    );

  const baseSeconds =
    sumSeconds(warmupSteps) +
    sumSeconds(cooldownSteps);

  const availableMainSeconds =
    Math.max(
      0,
      targetSeconds -
        baseSeconds
    );

  const mainWorkout =
    buildMainWorkout(
      personalizedMainExercises,
      availableMainSeconds
    );

  const mainSteps =
    mainWorkout.steps;

  const allSteps = [
    ...warmupSteps,
    ...mainSteps,
    ...cooldownSteps
  ];

  const totalSeconds =
    sumSeconds(allSteps);

  const config =
    GOAL_CONFIG[selectedGoal];

  return {
    day: plan.day,

    title: plan.title,

    focus:
      selectedGoal === "general"
        ? plan.focus
        : `${plan.focus} • ${config.label}`,

    type: plan.type,

    requestedMinutes:
      selectedDuration,

    estimatedMinutes:
      formatMinutes(
        totalSeconds
      ),

    exercises:
      allSteps,

    phases: [
      {
        name: "Warm-up",
        exercises:
          warmupSteps
      },
      {
        name: "Main Workout",
        exercises:
          mainSteps
      },
      {
        name: "Cool-down",
        exercises:
          cooldownSteps
      }
    ],

    totalExercises:
      allSteps.length,

    totalSeconds,

    rounds:
      Math.max(
        1,
        mainWorkout.rounds
      ),

    fitnessGoal:
      selectedGoal,

    fitnessGoalLabel:
      config.label,

    workoutLevel:
      preferences.workoutLevel,

    personalized:
      true,

    recommendation:
      config.focus
  };
}

export function getWeeklySmartWorkouts(
  duration,
  trainingState = loadTrainingState()
) {
  const today = new Date();

  const mondayIndex =
    getDayIndex(today);

  return weeklyWorkoutPlan.map(
    (_, index) => {
      const date =
        new Date(today);

      date.setDate(
        today.getDate() +
          index -
          mondayIndex
      );

      return generateSmartWorkout({
        date,
        duration,
        trainingState
      });
    }
  );
}

export function getWorkoutStatistics(
  workout
) {
  const phases =
    workout.phases.map(
      phase => ({
        name: phase.name,

        exercises:
          phase.exercises.length,

        seconds:
          sumSeconds(
            phase.exercises
          )
      })
    );

  const categories = {};

  workout.exercises.forEach(
    exercise => {
      categories[
        exercise.category
      ] =
        (
          categories[
            exercise.category
          ] || 0
        ) + 1;
    }
  );

  return {
    totalSteps:
      workout.totalExercises,

    estimatedMinutes:
      workout.estimatedMinutes,

    totalSeconds:
      workout.totalSeconds,

    rounds:
      workout.rounds,

    phases,

    categories,

    fitnessGoal:
      workout.fitnessGoal ||
      "general",

    fitnessGoalLabel:
      workout.fitnessGoalLabel ||
      "General Fitness",

    personalized:
      workout.personalized ||
      false
  };
}

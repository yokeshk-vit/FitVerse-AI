
/*
  FITVERSE AI 2.0
  Advanced Exercise Library

  Contains:
  - 40+ exercises and variations
  - Warm-up and cool-down movements
  - Strength, cardio, core and mobility
  - Four exercise difficulty stages
  - Beginner-friendly alternatives
  - Suggested duration and recovery
*/

export const exerciseLibrary = {
  // =========================
  // WARM-UP EXERCISES
  // =========================

  marching: {
    id: "marching",
    name: "Marching in Place",
    category: "Warm-up",
    muscle: "Full Body",
    level: 1,
    duration: 60,
    rest: 15,
    icon: "🚶",
    instructions:
      "March at a comfortable pace while moving your arms naturally.",
    alternative: "Seated Marching",
    equipment: "None"
  },

  armCircles: {
    id: "armCircles",
    name: "Arm Circles",
    category: "Warm-up",
    muscle: "Shoulders",
    level: 1,
    duration: 45,
    rest: 15,
    icon: "🔄",
    instructions:
      "Extend your arms comfortably and make small, controlled circles in both directions.",
    alternative: "Gentle Shoulder Rolls",
    equipment: "None"
  },

  shoulderRolls: {
    id: "shoulderRolls",
    name: "Shoulder Rolls",
    category: "Warm-up",
    muscle: "Shoulders",
    level: 1,
    duration: 45,
    rest: 15,
    icon: "🌿",
    instructions:
      "Slowly roll your shoulders forward and backward without forcing the movement.",
    alternative: "Small Shoulder Movements",
    equipment: "None"
  },

  hipCircles: {
    id: "hipCircles",
    name: "Hip Circles",
    category: "Warm-up",
    muscle: "Hips",
    level: 1,
    duration: 45,
    rest: 15,
    icon: "🔄",
    instructions:
      "Stand comfortably and move your hips through gentle circles.",
    alternative: "Standing Hip Shifts",
    equipment: "None"
  },

  sideSteps: {
    id: "sideSteps",
    name: "Side Steps",
    category: "Warm-up",
    muscle: "Legs",
    level: 1,
    duration: 60,
    rest: 15,
    icon: "👟",
    instructions:
      "Step sideways at a comfortable pace, alternating directions.",
    alternative: "Seated Side Taps",
    equipment: "None"
  },

  // =========================
  // UPPER BODY EXERCISES
  // =========================

  wallPushups: {
    id: "wallPushups",
    name: "Wall Push-ups",
    category: "Strength",
    muscle: "Chest & Arms",
    level: 1,
    duration: 60,
    rest: 30,
    icon: "💪",
    instructions:
      "Place your hands against a stable wall, bend your elbows slowly, then press away.",
    alternative: "Standing Wall Press",
    equipment: "Wall"
  },

  inclinePushups: {
    id: "inclinePushups",
    name: "Incline Push-ups",
    category: "Strength",
    muscle: "Chest & Arms",
    level: 2,
    duration: 60,
    rest: 30,
    icon: "💪",
    instructions:
      "Place your hands on a stable elevated surface and perform controlled push-ups.",
    alternative: "Wall Push-ups",
    equipment: "Stable elevated surface"
  },

  pushups: {
    id: "pushups",
    name: "Standard Push-ups",
    category: "Strength",
    muscle: "Chest & Triceps",
    level: 3,
    duration: 60,
    rest: 40,
    icon: "🔥",
    instructions:
      "Maintain a comfortable aligned position and lower your body with control.",
    alternative: "Incline Push-ups",
    equipment: "None"
  },

  tempoPushups: {
    id: "tempoPushups",
    name: "Slow Tempo Push-ups",
    category: "Strength",
    muscle: "Chest & Triceps",
    level: 4,
    duration: 60,
    rest: 45,
    icon: "⚡",
    instructions:
      "Perform a push-up using a slow, controlled lowering phase without forcing repetitions.",
    alternative: "Standard Push-ups",
    equipment: "None"
  },

  wallSlides: {
    id: "wallSlides",
    name: "Wall Slides",
    category: "Mobility",
    muscle: "Shoulders & Upper Back",
    level: 1,
    duration: 60,
    rest: 20,
    icon: "🧍",
    instructions:
      "Stand against a wall and gently slide your arms upward and downward.",
    alternative: "Shoulder Rolls",
    equipment: "Wall"
  },

  scapularPushups: {
    id: "scapularPushups",
    name: "Scapular Push-ups",
    category: "Stability",
    muscle: "Shoulders",
    level: 2,
    duration: 45,
    rest: 25,
    icon: "🎯",
    instructions:
      "In a supported plank or wall position, gently move your shoulder blades while keeping elbows mostly straight.",
    alternative: "Wall Scapular Press",
    equipment: "None"
  },

  pikePushups: {
    id: "pikePushups",
    name: "Pike Push-ups",
    category: "Strength",
    muscle: "Shoulders",
    level: 3,
    duration: 45,
    rest: 40,
    icon: "💪",
    instructions:
      "From a stable inverted-V position, bend your elbows comfortably and press back up.",
    alternative: "Wall Push-ups",
    equipment: "None"
  },

  // =========================
  // LOWER BODY EXERCISES
  // =========================

  chairSquats: {
    id: "chairSquats",
    name: "Chair Squats",
    category: "Strength",
    muscle: "Legs & Glutes",
    level: 1,
    duration: 60,
    rest: 30,
    icon: "🪑",
    instructions:
      "Lower toward a stable chair and stand back up with control.",
    alternative: "Supported Sit-to-Stand",
    equipment: "Stable chair"
  },

  squats: {
    id: "squats",
    name: "Bodyweight Squats",
    category: "Strength",
    muscle: "Quadriceps & Glutes",
    level: 2,
    duration: 60,
    rest: 30,
    icon: "🦵",
    instructions:
      "Bend at your hips and knees to a comfortable depth, then return to standing.",
    alternative: "Chair Squats",
    equipment: "None"
  },

  splitSquats: {
    id: "splitSquats",
    name: "Supported Split Squats",
    category: "Strength",
    muscle: "Legs & Balance",
    level: 3,
    duration: 60,
    rest: 40,
    icon: "🏋️",
    instructions:
      "Stand in a split stance, hold stable support if needed, and lower with control.",
    alternative: "Chair Squats",
    equipment: "Optional stable support"
  },

  reverseLunges: {
    id: "reverseLunges",
    name: "Reverse Lunges",
    category: "Strength",
    muscle: "Legs & Glutes",
    level: 4,
    duration: 60,
    rest: 40,
    icon: "🦵",
    instructions:
      "Step backward into a comfortable lunge, return to standing, and alternate sides.",
    alternative: "Supported Split Squats",
    equipment: "None"
  },

  calfRaises: {
    id: "calfRaises",
    name: "Calf Raises",
    category: "Strength",
    muscle: "Calves",
    level: 1,
    duration: 45,
    rest: 20,
    icon: "👟",
    instructions:
      "Stand near stable support and slowly lift and lower your heels.",
    alternative: "Seated Calf Raises",
    equipment: "Optional stable support"
  },

  standingHipAbduction: {
    id: "standingHipAbduction",
    name: "Standing Side Leg Raises",
    category: "Strength",
    muscle: "Hips & Glutes",
    level: 1,
    duration: 60,
    rest: 20,
    icon: "🦵",
    instructions:
      "Hold a stable support and gently raise one leg sideways without leaning.",
    alternative: "Small Side Leg Lifts",
    equipment: "Stable support"
  },

  // =========================
  // GLUTE EXERCISES
  // =========================

  gluteBridge: {
    id: "gluteBridge",
    name: "Glute Bridges",
    category: "Strength",
    muscle: "Glutes & Hips",
    level: 1,
    duration: 60,
    rest: 25,
    icon: "🌉",
    instructions:
      "Lie on your back with knees bent and lift your hips gently before lowering.",
    alternative: "Small Range Glute Bridge",
    equipment: "Mat optional"
  },

  bridgeHold: {
    id: "bridgeHold",
    name: "Glute Bridge Hold",
    category: "Strength",
    muscle: "Glutes",
    level: 2,
    duration: 45,
    rest: 30,
    icon: "🎯",
    instructions:
      "Raise your hips into a comfortable bridge and hold while breathing naturally.",
    alternative: "Glute Bridges",
    equipment: "Mat optional"
  },

  staggeredBridge: {
    id: "staggeredBridge",
    name: "Staggered-Stance Bridge",
    category: "Strength",
    muscle: "Glutes",
    level: 3,
    duration: 60,
    rest: 35,
    icon: "🌉",
    instructions:
      "Place one foot slightly ahead of the other and perform controlled bridges.",
    alternative: "Glute Bridge Hold",
    equipment: "Mat optional"
  },

  singleLegBridge: {
    id: "singleLegBridge",
    name: "Single-Leg Glute Bridge",
    category: "Strength",
    muscle: "Glutes",
    level: 4,
    duration: 45,
    rest: 40,
    icon: "🔥",
    instructions:
      "With one foot supported, gently lift your hips while keeping your pelvis stable.",
    alternative: "Staggered-Stance Bridge",
    equipment: "Mat optional"
  },

  // =========================
  // CORE EXERCISES
  // =========================

  deadBug: {
    id: "deadBug",
    name: "Dead Bug",
    category: "Core",
    muscle: "Core Stability",
    level: 1,
    duration: 60,
    rest: 25,
    icon: "🎯",
    instructions:
      "Lie on your back and slowly extend opposite arms and legs with control.",
    alternative: "Heel Slides",
    equipment: "Mat optional"
  },

  kneePlank: {
    id: "kneePlank",
    name: "Knee Plank",
    category: "Core",
    muscle: "Core",
    level: 2,
    duration: 30,
    rest: 30,
    icon: "🎯",
    instructions:
      "Support your body on forearms and knees while maintaining comfortable alignment.",
    alternative: "Dead Bug",
    equipment: "Mat optional"
  },

  plank: {
    id: "plank",
    name: "Forearm Plank",
    category: "Core",
    muscle: "Core",
    level: 3,
    duration: 30,
    rest: 35,
    icon: "🔥",
    instructions:
      "Support yourself on forearms and toes while maintaining an aligned position.",
    alternative: "Knee Plank",
    equipment: "Mat optional"
  },

  sidePlank: {
    id: "sidePlank",
    name: "Side Plank",
    category: "Core",
    muscle: "Obliques",
    level: 4,
    duration: 30,
    rest: 35,
    icon: "🎯",
    instructions:
      "Support yourself on one forearm and maintain a stable position, then switch sides.",
    alternative: "Bent-Knee Side Plank",
    equipment: "Mat optional"
  },

  birdDog: {
    id: "birdDog",
    name: "Bird Dog",
    category: "Stability",
    muscle: "Core & Back",
    level: 1,
    duration: 60,
    rest: 20,
    icon: "🧘",
    instructions:
      "From hands and knees, slowly extend opposite arm and leg without twisting.",
    alternative: "Arm-Only Bird Dog",
    equipment: "Mat optional"
  },

  heelSlides: {
    id: "heelSlides",
    name: "Heel Slides",
    category: "Core",
    muscle: "Core Control",
    level: 1,
    duration: 60,
    rest: 20,
    icon: "🌿",
    instructions:
      "Lie on your back and slowly slide one heel away, then return.",
    alternative: "Gentle Knee Bends",
    equipment: "Mat optional"
  },

  seatedKneeRaises: {
    id: "seatedKneeRaises",
    name: "Seated Knee Raises",
    category: "Core",
    muscle: "Core & Hip Flexors",
    level: 1,
    duration: 45,
    rest: 20,
    icon: "🪑",
    instructions:
      "Sit upright on a stable chair and lift one knee at a time with control.",
    alternative: "Seated Marching",
    equipment: "Stable chair"
  },

  // =========================
  // CARDIO EXERCISES
  // =========================

  stepJacks: {
    id: "stepJacks",
    name: "Step Jacks",
    category: "Cardio",
    muscle: "Full Body",
    level: 1,
    duration: 60,
    rest: 25,
    icon: "⚡",
    instructions:
      "Step one foot sideways while lifting your arms, then alternate.",
    alternative: "Side Steps",
    equipment: "None"
  },

  jumpingJacks: {
    id: "jumpingJacks",
    name: "Jumping Jacks",
    category: "Cardio",
    muscle: "Full Body",
    level: 2,
    duration: 45,
    rest: 30,
    icon: "⚡",
    instructions:
      "Jump your feet apart while raising your arms, then return with control.",
    alternative: "Step Jacks",
    equipment: "None"
  },

  mountainClimbers: {
    id: "mountainClimbers",
    name: "Controlled Mountain Climbers",
    category: "Cardio",
    muscle: "Core & Cardio",
    level: 3,
    duration: 30,
    rest: 35,
    icon: "🔥",
    instructions:
      "From a stable plank, slowly alternate bringing your knees forward.",
    alternative: "Standing Knee Drives",
    equipment: "None"
  },

  cardioIntervals: {
    id: "cardioIntervals",
    name: "Adaptable Cardio Intervals",
    category: "Cardio",
    muscle: "Full Body",
    level: 4,
    duration: 60,
    rest: 45,
    icon: "⚡",
    instructions:
      "Alternate short comfortable cardio efforts with recovery periods. Adjust intensity as needed.",
    alternative: "Step Jacks",
    equipment: "None"
  },

  standingKneeDrives: {
    id: "standingKneeDrives",
    name: "Standing Knee Drives",
    category: "Cardio",
    muscle: "Legs & Core",
    level: 1,
    duration: 60,
    rest: 25,
    icon: "🚶",
    instructions:
      "Lift one knee toward your chest, lower gently, and alternate sides.",
    alternative: "Marching in Place",
    equipment: "None"
  },

  shadowBoxing: {
    id: "shadowBoxing",
    name: "Gentle Shadow Boxing",
    category: "Cardio",
    muscle: "Upper Body & Cardio",
    level: 1,
    duration: 60,
    rest: 25,
    icon: "🥊",
    instructions:
      "Perform comfortable, controlled punches into open space without locking your elbows.",
    alternative: "Alternating Arm Reaches",
    equipment: "None"
  },

  lowImpactSkaters: {
    id: "lowImpactSkaters",
    name: "Low-Impact Skater Steps",
    category: "Cardio",
    muscle: "Legs & Coordination",
    level: 2,
    duration: 45,
    rest: 30,
    icon: "👟",
    instructions:
      "Step diagonally from side to side while maintaining comfortable balance.",
    alternative: "Side Steps",
    equipment: "None"
  },

  // =========================
  // BALANCE & MOBILITY
  // =========================

  singleLegBalance: {
    id: "singleLegBalance",
    name: "Supported Single-Leg Balance",
    category: "Balance",
    muscle: "Balance & Stability",
    level: 1,
    duration: 45,
    rest: 20,
    icon: "⚖️",
    instructions:
      "Stand near stable support and gently lift one foot, switching sides as comfortable.",
    alternative: "Weight Shifts",
    equipment: "Stable support"
  },

  heelToeWalk: {
    id: "heelToeWalk",
    name: "Heel-to-Toe Walk",
    category: "Balance",
    muscle: "Coordination",
    level: 2,
    duration: 45,
    rest: 20,
    icon: "👟",
    instructions:
      "Walk slowly along a clear path, placing one foot near the other while staying balanced.",
    alternative: "Normal Slow Walking",
    equipment: "None"
  },

  catCow: {
    id: "catCow",
    name: "Cat-Cow Mobility",
    category: "Mobility",
    muscle: "Spine & Back",
    level: 1,
    duration: 60,
    rest: 15,
    icon: "🌿",
    instructions:
      "On hands and knees, gently alternate rounding and extending your back.",
    alternative: "Seated Back Mobility",
    equipment: "Mat optional"
  },

  thoracicRotation: {
    id: "thoracicRotation",
    name: "Gentle Thoracic Rotations",
    category: "Mobility",
    muscle: "Upper Back",
    level: 1,
    duration: 60,
    rest: 15,
    icon: "🔄",
    instructions:
      "Rotate your upper back gently through a comfortable range.",
    alternative: "Seated Gentle Rotations",
    equipment: "None"
  },

  hipFlexorStretch: {
    id: "hipFlexorStretch",
    name: "Hip Flexor Stretch",
    category: "Cool-down",
    muscle: "Hips",
    level: 1,
    duration: 45,
    rest: 15,
    icon: "🌿",
    instructions:
      "Use a supported split stance and gently shift forward until you feel a comfortable stretch.",
    alternative: "Standing Hip Mobility",
    equipment: "Optional support"
  },

  calfStretch: {
    id: "calfStretch",
    name: "Calf Stretch",
    category: "Cool-down",
    muscle: "Calves",
    level: 1,
    duration: 45,
    rest: 15,
    icon: "🌿",
    instructions:
      "Place one foot behind you and gently lean toward a wall to stretch the calf.",
    alternative: "Seated Ankle Mobility",
    equipment: "Wall"
  },

  chestStretch: {
    id: "chestStretch",
    name: "Gentle Chest Stretch",
    category: "Cool-down",
    muscle: "Chest",
    level: 1,
    duration: 45,
    rest: 15,
    icon: "🌿",
    instructions:
      "Gently open your arms and shoulders without pushing beyond a comfortable range.",
    alternative: "Shoulder Rolls",
    equipment: "None"
  },

  breathingRecovery: {
    id: "breathingRecovery",
    name: "Breathing & Recovery",
    category: "Cool-down",
    muscle: "Full Body",
    level: 1,
    duration: 60,
    rest: 0,
    icon: "🧘",
    instructions:
      "Sit or stand comfortably and allow your breathing to return to its natural pace.",
    alternative: "Comfortable Seated Rest",
    equipment: "None"
  }
};

// =========================
// WORKOUT PHASE LIBRARIES
// =========================

export const warmupExerciseIds = [
  "marching",
  "armCircles",
  "shoulderRolls",
  "hipCircles",
  "sideSteps"
];

export const cooldownExerciseIds = [
  "chestStretch",
  "hipFlexorStretch",
  "calfStretch",
  "breathingRecovery"
];

// =========================
// WEEKLY WORKOUT PLAN
// =========================

export const weeklyWorkoutPlan = [
  {
    day: "Monday",
    title: "Upper Body & Core",
    focus: "Upper-body strength and trunk stability",
    type: "training",
    exerciseIds: [
      "marching",
      "armCircles",
      "shoulderRolls",
      "wallPushups",
      "wallSlides",
      "scapularPushups",
      "birdDog",
      "deadBug",
      "seatedKneeRaises",
      "chestStretch",
      "breathingRecovery"
    ]
  },

  {
    day: "Tuesday",
    title: "Lower Body Strength",
    focus: "Leg strength, glutes and balance",
    type: "training",
    exerciseIds: [
      "marching",
      "hipCircles",
      "sideSteps",
      "chairSquats",
      "calfRaises",
      "standingHipAbduction",
      "gluteBridge",
      "singleLegBalance",
      "birdDog",
      "calfStretch",
      "breathingRecovery"
    ]
  },

  {
    day: "Wednesday",
    title: "Cardio & Coordination",
    focus: "Comfortable cardiovascular conditioning",
    type: "training",
    exerciseIds: [
      "marching",
      "armCircles",
      "sideSteps",
      "stepJacks",
      "standingKneeDrives",
      "shadowBoxing",
      "lowImpactSkaters",
      "seatedKneeRaises",
      "heelToeWalk",
      "calfStretch",
      "breathingRecovery"
    ]
  },

  {
    day: "Thursday",
    title: "Mobility & Recovery",
    focus: "Rest or comfortable mobility",
    type: "recovery",
    exerciseIds: [
      "shoulderRolls",
      "catCow",
      "thoracicRotation",
      "hipCircles",
      "breathingRecovery"
    ]
  },

  {
    day: "Friday",
    title: "Full Body Strength",
    focus: "Balanced upper and lower body training",
    type: "training",
    exerciseIds: [
      "marching",
      "armCircles",
      "hipCircles",
      "wallPushups",
      "chairSquats",
      "gluteBridge",
      "calfRaises",
      "birdDog",
      "deadBug",
      "chestStretch",
      "breathingRecovery"
    ]
  },

  {
    day: "Saturday",
    title: "Cardio, Core & Balance",
    focus: "Cardio fitness, stability and coordination",
    type: "training",
    exerciseIds: [
      "marching",
      "sideSteps",
      "armCircles",
      "stepJacks",
      "standingKneeDrives",
      "shadowBoxing",
      "birdDog",
      "deadBug",
      "singleLegBalance",
      "calfStretch",
      "breathingRecovery"
    ]
  },

  {
    day: "Sunday",
    title: "Rest & Recharge",
    focus: "Rest and optional gentle movement",
    type: "recovery",
    exerciseIds: [
      "breathingRecovery",
      "shoulderRolls",
      "catCow"
    ]
  }
];

// =========================
// LEGACY COMPATIBILITY
// =========================
// Keeps older components from failing if
// they still import workoutData.

export const workoutData = {
  beginner: [
    exerciseLibrary.marching,
    exerciseLibrary.wallPushups,
    exerciseLibrary.chairSquats,
    exerciseLibrary.deadBug,
    exerciseLibrary.breathingRecovery
  ],

  intermediate: [
    exerciseLibrary.armCircles,
    exerciseLibrary.inclinePushups,
    exerciseLibrary.squats,
    exerciseLibrary.gluteBridge,
    exerciseLibrary.plank,
    exerciseLibrary.breathingRecovery
  ]
};

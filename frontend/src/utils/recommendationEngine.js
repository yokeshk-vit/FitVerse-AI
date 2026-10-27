
/*
  FITVERSE AI
  INTELLIGENT PERSONALIZED MEAL RECOMMENDATION ENGINE

  Features:
  - Rule-based meal recommendations
  - Vegetarian preference filtering
  - Food avoidance and allergy keyword filtering
  - Fitness goal awareness
  - Food-group diversity
  - Explainable recommendations
  - Student Profile integration
  - Safety notices for unverified ingredients

  Important:
  This is an educational recommendation engine.
  It does not calculate calories, prescribe diets,
  or verify ingredients and allergens.
*/

const PROFILE_KEY = "fitverse-student-profile";

/* ==========================================
   FOOD CLASSIFICATION
========================================== */

const groups = {
  grains: [
    "rice",
    "chapathi",
    "chapati",
    "phulka",
    "pulka",
    "roti",
    "idly",
    "idli",
    "dosa",
    "paratha",
    "bread",
    "pongal",
    "upma",
    "kichidi",
    "khichdi",
    "pulao",
    "poha",
    "poori",
    "oats",
    "millet",
    "wheat"
  ],

  protein: [
    "dal",
    "dhal",
    "paneer",
    "channa",
    "chenna",
    "chickpea",
    "rajma",
    "sprouts",
    "sundal",
    "green gram",
    "moong",
    "masoor",
    "egg",
    "chicken",
    "fish",
    "milk",
    "curd",
    "soy",
    "tofu",
    "lentil",
    "sambar"
  ],

  vegetables: [
    "poriyal",
    "vegetable",
    "salad",
    "carrot",
    "cabbage",
    "beans",
    "palak",
    "keerai",
    "brinjal",
    "gourd",
    "broccoli",
    "beet",
    "spinach",
    "veg jalfrezi",
    "veg kholapuri",
    "cauliflower",
    "okra",
    "bhindi"
  ],

  fruits: [
    "banana",
    "papaya",
    "apple",
    "water melon",
    "watermelon",
    "musk melon",
    "muskmelon",
    "seasonal fruit",
    "guava",
    "orange",
    "grapes",
    "pomegranate",
    "pineapple"
  ]
};

const nonVegetarianTerms = [
  "chicken",
  "fish",
  "egg",
  "omelette",
  "omelet",
  "mutton",
  "meat",
  "prawn",
  "seafood",
  "french toast",
  "beef",
  "pork"
];

const ambiguousTerms = [
  "biryani",
  "biriyani",
  "fried rice",
  "noodles",
  "soup",
  "gravy",
  "curry",
  "manchurian",
  "sandwich"
];

const fitnessGoals = {
  general: {
    label: "General Fitness",
    priority: [
      "grains",
      "protein",
      "vegetables",
      "fruits"
    ],
    explanation:
      "A varied selection of foods can support everyday energy, growth and overall wellbeing."
  },

  strength: {
    label: "Strength Building",
    priority: [
      "protein",
      "grains",
      "vegetables",
      "fruits"
    ],
    explanation:
      "Regular meals containing protein-rich foods, grains and vegetables can support activity and recovery."
  },

  endurance: {
    label: "Endurance",
    priority: [
      "grains",
      "protein",
      "fruits",
      "vegetables"
    ],
    explanation:
      "Regular meals with grain-based foods and a variety of other food groups help support an active routine."
  },

  flexibility: {
    label: "Flexibility & Mobility",
    priority: [
      "vegetables",
      "fruits",
      "protein",
      "grains"
    ],
    explanation:
      "A varied eating pattern, sufficient fluids and regular meals support general wellbeing alongside mobility training."
  }
};

/* ==========================================
   UTILITY FUNCTIONS
========================================== */

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function contains(food, terms) {
  const name = normalizeText(food);

  return terms.some(term =>
    name.includes(normalizeText(term))
  );
}

function uniqueFoods(foods) {
  const seen = new Set();

  return foods.filter(food => {
    if (typeof food !== "string") {
      return false;
    }

    const key = normalizeText(food);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

/* ==========================================
   VEGETARIAN CANDIDATE FILTER
========================================== */

function isVegetarianCandidate(food) {
  const name = normalizeText(food);

  if (contains(name, nonVegetarianTerms)) {
    return false;
  }

  /*
    Ambiguous dishes are excluded unless
    explicitly described as vegetarian.

    This is only a keyword-based estimate.
    Ingredients still require confirmation.
  */

  if (
    contains(name, ambiguousTerms) &&
    !name.includes("veg ") &&
    !name.includes("vegetable ") &&
    !name.includes("paneer ") &&
    !name.includes("vegetarian ")
  ) {
    return false;
  }

  return true;
}

/* ==========================================
   EXTRACT MENU FOODS
========================================== */

function getFoods(mealData) {
  if (!mealData) {
    return [];
  }

  if (Array.isArray(mealData)) {
    return uniqueFoods(mealData);
  }

  const foods = [
    ...(Array.isArray(mealData.items)
      ? mealData.items
      : []),

    ...(Array.isArray(mealData.vegOptions)
      ? mealData.vegOptions
      : []),

    ...(Array.isArray(mealData.nonVegOptions)
      ? mealData.nonVegOptions
      : [])
  ];

  return uniqueFoods(foods);
}

/* ==========================================
   FOOD CATEGORY DETECTION
========================================== */

function getCategories(food) {
  return Object.entries(groups)
    .filter(([, keywords]) =>
      contains(food, keywords)
    )
    .map(([category]) => category);
}

/* ==========================================
   STUDENT PROFILE PREFERENCES
========================================== */

export function getMealPreferences() {
  const defaults = {
    diet: "nonveg",
    fitnessGoal: "general",
    workoutLevel: "beginner",
    avoidFoods: [],
    allergies: []
  };

  try {
    const stored = localStorage.getItem(
      PROFILE_KEY
    );

    if (!stored) {
      return defaults;
    }

    const profile = JSON.parse(stored);

    const goal = normalizeText(
      profile.fitnessGoal
    );

    return {
      diet:
        profile.messType === "veg"
          ? "veg"
          : "nonveg",

      fitnessGoal: fitnessGoals[goal]
        ? goal
        : "general",

      workoutLevel:
        profile.workoutLevel || "beginner",

      avoidFoods: Array.isArray(
        profile.avoidFoods
      )
        ? profile.avoidFoods
        : [],

      allergies: Array.isArray(
        profile.allergies
      )
        ? profile.allergies
        : []
    };
  } catch {
    return defaults;
  }
}

/* ==========================================
   CHOOSE FOOD BY CATEGORY
========================================== */

function chooseFood(
  foods,
  category,
  selected
) {
  return foods.find(food =>
    !selected.includes(food) &&
    getCategories(food).includes(category)
  );
}

/* ==========================================
   FITNESS GOAL EXPLANATION
========================================== */

function getGoalRecommendation(goal) {
  const selectedGoal =
    fitnessGoals[goal] ||
    fitnessGoals.general;

  return {
    goal,
    goalLabel: selectedGoal.label,
    explanation: selectedGoal.explanation,
    priority: selectedGoal.priority
  };
}

/* ==========================================
   MAIN MEAL RECOMMENDATION ENGINE
========================================== */

export function generateMealRecommendation(
  mealData,
  preferences = {}
) {
  const savedPreferences = getMealPreferences();

  /*
    Explicit preferences override saved
    Student Profile preferences.
  */

  const settings = {
    ...savedPreferences,
    ...preferences
  };

  const diet = settings.diet;

  const fitnessGoal = fitnessGoals[
    settings.fitnessGoal
  ]
    ? settings.fitnessGoal
    : "general";

  const avoidFoods = Array.isArray(
    settings.avoidFoods
  )
    ? settings.avoidFoods
    : [];

  const allergies = Array.isArray(
    settings.allergies
  )
    ? settings.allergies
    : [];

  const availableFoods = getFoods(mealData);

  /* FILTER FOODS */

  const excludedTerms = [
    ...avoidFoods,
    ...allergies
  ]
    .filter(term =>
      typeof term === "string" &&
      term.trim()
    )
    .map(normalizeText);

  const filteredFoods = availableFoods.filter(
    food => {
      if (
        diet === "veg" &&
        !isVegetarianCandidate(food)
      ) {
        return false;
      }

      return !excludedTerms.some(term =>
        normalizeText(food).includes(term)
      );
    }
  );

  /* CLASSIFY FOODS */

  const categories = {
    grains: [],
    protein: [],
    vegetables: [],
    fruits: [],
    other: []
  };

  filteredFoods.forEach(food => {
    const foodCategories = getCategories(food);

    if (foodCategories.length === 0) {
      categories.other.push(food);
    } else {
      foodCategories.forEach(category => {
        categories[category].push(food);
      });
    }
  });

  /* FITNESS GOAL PERSONALIZATION */

  const goalRecommendation =
    getGoalRecommendation(fitnessGoal);

  const suggestedFoods = [];

  goalRecommendation.priority.forEach(
    category => {
      const food = chooseFood(
        filteredFoods,
        category,
        suggestedFoods
      );

      if (food) {
        suggestedFoods.push(food);
      }
    }
  );

  /*
    If no recognized food groups are
    available, show other menu options.

    Do not invent foods that are not listed.
  */

  if (
    suggestedFoods.length === 0 &&
    filteredFoods.length > 0
  ) {
    suggestedFoods.push(
      ...filteredFoods.slice(0, 4)
    );
  }

  /* EXPLAINABLE RECOMMENDATIONS */

  const explanations = [];

  explanations.push(
    goalRecommendation.explanation
  );

  if (categories.grains.length > 0) {
    explanations.push(
      "Grain-based foods provide energy for everyday activities."
    );
  }

  if (categories.protein.length > 0) {
    explanations.push(
      "Protein-containing foods support growth and muscle recovery."
    );
  }

  if (categories.vegetables.length > 0) {
    explanations.push(
      "Vegetables provide fibre and important micronutrients."
    );
  }

  if (categories.fruits.length > 0) {
    explanations.push(
      "Fruits contribute vitamins, minerals and variety."
    );
  }

  /* OPTIONAL ADDITIONS */

  const additionalFoods = [];

  if (!categories.protein.length) {
    additionalFoods.push(
      "Consider including dal, chickpeas, milk, curd or another suitable protein-containing food when available."
    );
  }

  if (!categories.vegetables.length) {
    additionalFoods.push(
      "Include a vegetable dish or salad when available."
    );
  }

  if (!categories.fruits.length) {
    additionalFoods.push(
      "Enjoy a fresh seasonal fruit as part of your day."
    );
  }

  if (!categories.grains.length) {
    additionalFoods.push(
      "Include a grain-based food such as rice, chapati or another suitable option when available."
    );
  }

  /* PERSONALIZED INSIGHTS */

  const personalizedInsights = [];

  personalizedInsights.push(
    `Fitness focus: ${goalRecommendation.goalLabel}.`
  );

  if (diet === "veg") {
    personalizedInsights.push(
      "Your vegetarian preference has been applied using menu-name keywords. Confirm ingredients with mess staff."
    );
  } else {
    personalizedInsights.push(
      "Vegetarian and non-vegetarian menu options can be considered according to your preferences."
    );
  }

  personalizedInsights.push(
    "Choose comfortable portions based on your appetite and activity. Regular, varied meals and adequate hydration matter."
  );

  if (allergies.length > 0) {
    personalizedInsights.push(
      "Allergy keywords have been filtered, but this does not establish allergen safety. Confirm ingredients and cross-contact with mess staff."
    );
  }

  /* MENU AVAILABILITY STATUS */

  const hasAvailableFoods =
    filteredFoods.length > 0;

  const status = !availableFoods.length
    ? "no_menu"
    : !hasAvailableFoods
    ? "no_matching_foods"
    : "available";

  /* FINAL OUTPUT */

  return {
    availableFoods,
    filteredFoods,
    suggestedFoods,
    categories,
    explanations,
    additionalFoods,

    fitnessGoal,
    fitnessGoalLabel:
      goalRecommendation.goalLabel,

    personalizedInsights,

    diet,
    status,

    personalized: true,

    notice:
      "These are illustrative food-group suggestions, not verified meal plans. Ingredients, allergens and preparation methods must be confirmed with mess staff. Keyword filtering cannot guarantee allergy safety. No nutritional quantities have been calculated."
  };
}

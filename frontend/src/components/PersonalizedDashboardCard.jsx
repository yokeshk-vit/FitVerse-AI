
import { useEffect, useState } from "react";

import {
  Activity,
  ArrowRight,
  Clock3,
  Dumbbell,
  HeartPulse,
  Sparkles,
  Target,
  Zap,
  UtensilsCrossed,
  Leaf,
  ChefHat,
  Droplets,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  Lightbulb
} from "lucide-react";

import {
  generateSmartWorkout,
  getWorkoutPreferences
} from "../utils/smartWorkoutGenerator";

import {
  loadTrainingState,
  getTrainingSummary
} from "../utils/adaptiveWorkoutEngine";

import {
  generateMealRecommendation,
  getMealPreferences
} from "../utils/recommendationEngine";

import { messData } from "../data/messData";
import { messDataV2 } from "../data/messDataV2";

/* ==========================================
   FITVERSE DASHBOARD STYLES
========================================== */

const styles = {
  card: {
    background:
      "linear-gradient(135deg, #1c3020 0%, #142319 100%)",
    border: "1px solid #365337",
    borderRadius: 20,
    padding: 26,
    color: "#f4f8f0",
    marginBottom: 26,
    boxShadow: "0 12px 32px rgba(0,0,0,0.12)"
  },

  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 22
  },

  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#b8f548",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.5,
    marginBottom: 9
  },

  title: {
    fontSize: 23,
    fontWeight: 800,
    margin: 0
  },

  description: {
    fontSize: 13,
    lineHeight: 1.8,
    color: "#b8cbb5",
    margin: "10px 0 0"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 14
  },

  metric: {
    padding: 18,
    background: "rgba(255,255,255,0.035)",
    border: "1px solid #344a35",
    borderRadius: 13
  },

  metricLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#a9c19f",
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 12
  },

  metricValue: {
    display: "block",
    color: "#f6faef",
    fontSize: 19,
    fontWeight: 800,
    lineHeight: 1.4
  },

  metricNote: {
    display: "block",
    marginTop: 7,
    color: "#8fa58c",
    fontSize: 11
  },

  section: {
    marginTop: 20,
    padding: 21,
    borderRadius: 14,
    background: "rgba(255,255,255,0.035)",
    border: "1px solid #344a35"
  },

  workout: {
    marginTop: 18,
    padding: 20,
    borderRadius: 14,
    background: "rgba(184,245,72,0.075)",
    border: "1px solid rgba(184,245,72,0.2)"
  },

  workoutTop: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#b8f548",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1
  },

  workoutTitle: {
    margin: "12px 0 7px",
    fontSize: 19,
    color: "#f5f9ef"
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    color: "#e7f7db",
    fontSize: 17,
    fontWeight: 800,
    margin: "0 0 12px"
  },

  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16
  },

  foodChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 13px",
    border: "1px solid #527448",
    borderRadius: 10,
    background: "#29432b",
    color: "#e2f5d1",
    fontSize: 12,
    fontWeight: 700
  },

  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    background: "#b8f548",
    color: "#16230d",
    border: "none",
    borderRadius: 10,
    padding: "12px 18px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 18
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    background: "#29462d",
    color: "#c9f6a4",
    border: "1px solid #54754a",
    borderRadius: 10,
    padding: "12px 18px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 18
  },

  insight: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "13px 0",
    borderBottom: "1px solid #344a35",
    color: "#bfd4b8",
    fontSize: 12,
    lineHeight: 1.8
  },

  footer: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    color: "#a9c6a3",
    fontSize: 12,
    lineHeight: 1.7,
    marginTop: 18
  }
};

/* ==========================================
   HELPER FUNCTIONS
========================================== */

function getTodayName() {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  return days[new Date().getDay()];
}

function getStudentProfile() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "fitverse-student-profile"
      ) || "{}"
    );
  } catch {
    return {};
  }
}

function getTodayMenu(profile) {
  const hostel =
    profile.hostel === "girls"
      ? "girls"
      : "boys";

  const messType = [
    "veg",
    "nonveg",
    "special"
  ].includes(profile.messType)
    ? profile.messType
    : "veg";

  const day = getTodayName();

  const menu =
    messDataV2[hostel]?.[messType]?.[day] ??
    messData[hostel]?.[messType]?.[day];

  return {
    menu,
    hostel,
    messType,
    day
  };
}

function getCurrentMealType() {
  const hour = new Date().getHours();

  if (hour < 11) {
    return "breakfast";
  }

  if (hour < 16) {
    return "lunch";
  }

  if (hour < 19) {
    return "snacks";
  }

  return "dinner";
}

function getMealLabel(type) {
  const labels = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    snacks: "Evening Snacks",
    dinner: "Dinner"
  };

  return labels[type] || "Meal";
}

/* ==========================================
   DAILY WELLNESS INSIGHTS
========================================== */

function generateWellnessInsights(
  workout,
  summary,
  mealRecommendation
) {
  const insights = [];

  if (workout.type === "recovery") {
    insights.push({
      icon: HeartPulse,
      text:
        "Today includes an optional recovery session. Rest, gentle movement and comfortable pacing are all valid choices."
    });
  } else {
    insights.push({
      icon: Dumbbell,
      text:
        "Your suggested workout is flexible. Warm up, move at a comfortable pace and take breaks whenever needed."
    });
  }

  insights.push({
    icon: Droplets,
    text:
      "Drink water regularly throughout the day, especially around physical activity and in warm weather."
  });

  if (
    mealRecommendation?.suggestedFoods?.length > 0
  ) {
    insights.push({
      icon: UtensilsCrossed,
      text:
        "Your mess menu contains foods that may contribute to a varied eating pattern. Choose foods you enjoy and check ingredients when needed."
    });
  } else {
    insights.push({
      icon: Leaf,
      text:
        "Explore the available mess menu for a variety of foods. Ask mess staff about suitable alternatives if your preferred foods are not listed."
    });
  }

  insights.push({
    icon: CalendarDays,
    text:
      "Consistent routines can help, but flexibility matters too. Sleep, recovery and regular meals support everyday wellbeing."
  });

  return insights;
}

/* ==========================================
   LOAD DASHBOARD DATA
========================================== */

function loadDashboardData() {
  const preferences =
    getWorkoutPreferences();

  const trainingState =
    loadTrainingState();

  const summary =
    getTrainingSummary(trainingState);

  const workout =
    generateSmartWorkout({
      date: new Date(),
      duration: preferences.workoutDuration,
      fitnessGoal: preferences.fitnessGoal,
      trainingState
    });

  const profile =
    getStudentProfile();

  const mealPreferences =
    getMealPreferences();

  const menuInfo =
    getTodayMenu(profile);

  const currentMeal =
    getCurrentMealType();

  const mealData =
    menuInfo.menu?.[currentMeal];

  const recommendation =
    mealData
      ? generateMealRecommendation(
          mealData,
          {
            ...mealPreferences,

            diet:
              menuInfo.messType === "veg"
                ? "veg"
                : mealPreferences.diet,

            fitnessGoal:
              preferences.fitnessGoal
          }
        )
      : null;

  const insights =
    generateWellnessInsights(
      workout,
      summary,
      recommendation
    );

  return {
    preferences,
    workout,
    summary,
    profile,
    menuInfo,
    currentMeal,
    recommendation,
    insights
  };
}

/* ==========================================
   MAIN DASHBOARD COMPONENT
========================================== */

export default function PersonalizedDashboardCard({
  onOpenWorkout,
  onOpenMessMenu
}) {
  const [data, setData] =
    useState(loadDashboardData);

  useEffect(() => {
    function refresh() {
      setData(loadDashboardData());
    }

    window.addEventListener(
      "fitverse-profile-updated",
      refresh
    );

    window.addEventListener(
      "focus",
      refresh
    );

    window.addEventListener(
      "storage",
      refresh
    );

    return () => {
      window.removeEventListener(
        "fitverse-profile-updated",
        refresh
      );

      window.removeEventListener(
        "focus",
        refresh
      );

      window.removeEventListener(
        "storage",
        refresh
      );
    };
  }, []);

  const {
    preferences,
    workout,
    summary,
    menuInfo,
    currentMeal,
    recommendation,
    insights
  } = data;

  const isRecovery =
    workout.type === "recovery";

  const experience =
    preferences.workoutLevel === "intermediate"
      ? "Intermediate"
      : "Beginner";

  const suggestedFoods =
    recommendation?.suggestedFoods || [];

  return (
    <section style={styles.card}>

      {/* =====================================
          DASHBOARD HEADER
      ===================================== */}

      <div style={styles.heading}>
        <div>
          <span style={styles.eyebrow}>
            <Sparkles size={16} />
            FITVERSE SMART PERSONALIZATION
          </span>

          <h3 style={styles.title}>
            Your Fitness & Nutrition Dashboard
          </h3>

          <p style={styles.description}>
            Your daily overview of fitness,
            campus dining and wellness,
            based on your saved preferences.
          </p>
        </div>

        <Target
          size={31}
          color="#b8f548"
        />
      </div>

      {/* =====================================
          PROFILE & PROGRESS METRICS
      ===================================== */}

      <div style={styles.grid}>

        {/* FITNESS GOAL */}

        <div style={styles.metric}>
          <span style={styles.metricLabel}>
            <Target size={16} />
            FITNESS GOAL
          </span>

          <strong style={styles.metricValue}>
            {preferences.goalLabel}
          </strong>

          <small style={styles.metricNote}>
            From Student Profile
          </small>
        </div>

        {/* DURATION */}

        <div style={styles.metric}>
          <span style={styles.metricLabel}>
            <Clock3 size={16} />
            PREFERRED DURATION
          </span>

          <strong style={styles.metricValue}>
            {preferences.workoutDuration} min
          </strong>

          <small style={styles.metricNote}>
            Flexible session length
          </small>
        </div>

        {/* EXPERIENCE */}

        <div style={styles.metric}>
          <span style={styles.metricLabel}>
            <Dumbbell size={16} />
            EXPERIENCE
          </span>

          <strong style={styles.metricValue}>
            {experience}
          </strong>

          <small style={styles.metricNote}>
            Your selected starting level
          </small>
        </div>

        {/* COMPLETED SESSIONS */}

        <div style={styles.metric}>
          <span style={styles.metricLabel}>
            <Activity size={16} />
            SAVED SESSIONS
          </span>

          <strong style={styles.metricValue}>
            {summary.totalSessions}
          </strong>

          <small style={styles.metricNote}>
            Recorded workout history
          </small>
        </div>
      </div>

      {/* =====================================
          SMART WORKOUT SECTION
      ===================================== */}

      <div style={styles.workout}>
        <span style={styles.workoutTop}>
          <Zap size={16} />

          {isRecovery
            ? "TODAY'S OPTIONAL RECOVERY"
            : "TODAY'S PERSONALIZED WORKOUT"}
        </span>

        <h4 style={styles.workoutTitle}>
          {workout.title}
        </h4>

        <p style={styles.description}>
          {workout.focus}
        </p>

        <p style={styles.description}>
          <Clock3
            size={15}
            style={{
              verticalAlign: "middle"
            }}
          />

          {" "}
          Approximately
          {" "}
          {workout.estimatedMinutes}
          {" "}
          minutes
          {" • "}
          {workout.totalExercises}
          {" "}
          guided steps
        </p>

        <button
          type="button"
          style={styles.button}
          onClick={onOpenWorkout}
          disabled={!onOpenWorkout}
        >
          {isRecovery
            ? "Explore Recovery"
            : "Open My Workout"}

          <ArrowRight size={17} />
        </button>
      </div>

      {/* =====================================
          SMART NUTRITION SECTION
      ===================================== */}

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>
          <ChefHat
            size={22}
            color="#b8f548"
          />

          Today's Smart Nutrition
        </h4>

        <p style={styles.description}>
          {menuInfo.day}
          {" • "}
          {menuInfo.hostel === "boys"
            ? "Boys Hostel"
            : "Girls Hostel"}
          {" • "}
          {menuInfo.messType === "veg"
            ? "Vegetarian"
            : menuInfo.messType === "nonveg"
            ? "Non-Vegetarian"
            : "Special"}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
            color: "#b8f548",
            fontSize: 12,
            fontWeight: 800
          }}
        >
          <UtensilsCrossed size={17} />

          {getMealLabel(currentMeal)}
          {" "}
          Suggestions
        </div>

        {suggestedFoods.length > 0 ? (
          <div style={styles.chipContainer}>
            {suggestedFoods.map(
              (food, index) => (
                <span
                  key={`${food}-${index}`}
                  style={styles.foodChip}
                >
                  <CheckCircle2 size={15} />
                  {food}
                </span>
              )
            )}
          </div>
        ) : (
          <p style={styles.description}>
            No matching food suggestions
            are available for this meal.
            Explore the complete mess menu
            for more options.
          </p>
        )}

        {recommendation?.explanations?.[0] && (
          <p
            style={{
              ...styles.description,
              marginTop: 16
            }}
          >
            <Lightbulb
              size={16}
              style={{
                verticalAlign: "middle",
                marginRight: 6,
                color: "#b8f548"
              }}
            />

            {recommendation.explanations[0]}
          </p>
        )}

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={onOpenMessMenu}
          disabled={!onOpenMessMenu}
        >
          Explore Mess Menu

          <ArrowRight size={17} />
        </button>
      </div>

      {/* =====================================
          DAILY WELLNESS INSIGHTS
      ===================================== */}

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>
          <HeartPulse
            size={22}
            color="#b8f548"
          />

          Daily Wellness Insights
        </h4>

        <p style={styles.description}>
          Simple suggestions to support
          your daily activity, recovery,
          hydration and food variety.
        </p>

        <div style={{ marginTop: 12 }}>
          {insights.map(
            (insight, index) => {
              const Icon = insight.icon;

              return (
                <div
                  key={index}
                  style={styles.insight}
                >
                  <Icon
                    size={19}
                    color="#b8f548"
                    style={{
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  />

                  <span>
                    {insight.text}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* =====================================
          SAFETY & PERSONALIZATION NOTE
      ===================================== */}

      <div style={styles.footer}>
        <ShieldCheck
          size={18}
          style={{ flexShrink: 0 }}
        />

        <span>
          FitVerse suggestions are generated
          using rules and your saved preferences.
          Workouts are flexible, and rest is
          important. Food suggestions are not
          verified meal plans; confirm ingredients
          and allergens with mess staff.
        </span>
      </div>
    </section>
  );
}

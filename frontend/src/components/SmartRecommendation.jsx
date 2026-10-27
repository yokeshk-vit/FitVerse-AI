
import { useEffect, useMemo, useState } from "react";

import {
  Sparkles,
  Leaf,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  UtensilsCrossed,
  ArrowRight,
  ChefHat,
  Salad,
  ShieldCheck,
  Target,
  HeartPulse,
  RefreshCw,
  Info
} from "lucide-react";

import {
  generateMealRecommendation,
  getMealPreferences
} from "../utils/recommendationEngine";

import "./SmartRecommendation.css";

/* ==========================================
   FITVERSE AI — SMART MEAL ADVISOR
========================================== */

const mealOptions = [
  {
    value: "breakfast",
    label: "Breakfast"
  },
  {
    value: "lunch",
    label: "Lunch"
  },
  {
    value: "snacks",
    label: "Evening Snacks"
  },
  {
    value: "dinner",
    label: "Dinner"
  }
];

const goalLabels = {
  general: "General Fitness",
  strength: "Strength Building",
  endurance: "Endurance",
  flexibility: "Flexibility & Mobility"
};

const extraStyles = {
  profileBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    padding: 16,
    marginBottom: 20,
    border: "1px solid #3c593c",
    borderRadius: 12,
    background: "#1b3021"
  },

  profileChip: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "10px 13px",
    border: "1px solid #496a40",
    borderRadius: 9,
    background: "#28432a",
    color: "#d9f5c4",
    fontSize: 12,
    fontWeight: 700
  },

  goalBox: {
    marginBottom: 20,
    padding: 18,
    border: "1px solid #48683d",
    borderRadius: 12,
    background:
      "linear-gradient(135deg, #223b27, #182d20)"
  },

  goalLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 9,
    color: "#b8f548",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1
  },

  goalTitle: {
    margin: "0 0 10px",
    color: "#eff9e8",
    fontSize: 19,
    fontWeight: 900
  },

  goalDescription: {
    margin: 0,
    color: "#bbcfb6",
    fontSize: 12,
    lineHeight: 1.8
  },

  insightSection: {
    marginTop: 20,
    padding: 18,
    border: "1px solid #3c573d",
    borderRadius: 12,
    background: "#1b3021"
  },

  insightTitle: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginBottom: 15,
    color: "#d9f6c3",
    fontSize: 14,
    fontWeight: 900
  },

  insightItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
    color: "#c0d3bc",
    fontSize: 12,
    lineHeight: 1.8
  },

  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 12px",
    border: "1px solid #54744a",
    borderRadius: 9,
    background: "#29452c",
    color: "#c8f4a1",
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer"
  }
};

/* ==========================================
   MAIN COMPONENT
========================================== */

export default function SmartRecommendation({
  selectedMenu,
  selectedDiet
}) {
  const [mealType, setMealType] =
    useState("lunch");

  const [preferences, setPreferences] =
    useState(getMealPreferences);

  const [diet, setDiet] = useState(
    () => selectedDiet || getMealPreferences().diet
  );

  const [showResult, setShowResult] =
    useState(false);

  /* ========================================
     PROFILE SYNCHRONIZATION
  ======================================== */

  function syncPreferences() {
    const updated = getMealPreferences();

    setPreferences(updated);

    setDiet(
      selectedDiet || updated.diet
    );

    setShowResult(false);
  }

  useEffect(() => {
    function handleProfileUpdate() {
      syncPreferences();
    }

    function handleStorage(event) {
      if (
        !event.key ||
        event.key === "fitverse-student-profile"
      ) {
        handleProfileUpdate();
      }
    }

    window.addEventListener(
      "fitverse-profile-updated",
      handleProfileUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "fitverse-profile-updated",
        handleProfileUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [selectedDiet]);

  useEffect(() => {
    if (selectedDiet) {
      setDiet(selectedDiet);
      setShowResult(false);
    }
  }, [selectedDiet]);

  /* ========================================
     CURRENT MEAL DATA
  ======================================== */

  const mealData = selectedMenu?.[mealType];

  const fitnessGoal =
    preferences.fitnessGoal || "general";

  const goalLabel =
    goalLabels[fitnessGoal] ||
    goalLabels.general;

  /* ========================================
     PERSONALIZED RECOMMENDATION
  ======================================== */

  const recommendation = useMemo(() => {
    if (!mealData) {
      return null;
    }

    return generateMealRecommendation(
      mealData,
      {
        ...preferences,
        diet,
        fitnessGoal
      }
    );
  }, [mealData, preferences, diet, fitnessGoal]);

  /* ========================================
     GENERATE RECOMMENDATION
  ======================================== */

  function handleGenerate() {
    if (mealData) {
      setShowResult(true);
    }
  }

  function changeMealType(value) {
    setMealType(value);
    setShowResult(false);
  }

  function changeDiet(value) {
    setDiet(value);
    setShowResult(false);
  }

  /* ========================================
     COMPONENT UI
  ======================================== */

  return (
    <section className="fvs-advisor">

      {/* HEADER */}

      <div className="fvs-advisor-header">
        <div className="fvs-advisor-icon">
          <ChefHat size={29} />
        </div>

        <div className="fvs-advisor-heading">
          <span>
            YOUR PERSONAL FOOD COMPANION
          </span>

          <h2>Smart Meal Advisor</h2>

          <p>
            Discover personalized meal suggestions
            using foods listed in your selected
            VIT campus mess menu.
          </p>
        </div>

        <div className="fvs-ai-mark">
          <Sparkles size={15} />
          SMART SUGGESTIONS
        </div>
      </div>

      <div className="fvs-advisor-body">

        {/* STUDENT PROFILE SUMMARY */}

        <div style={extraStyles.profileBar}>
          <div style={extraStyles.profileChip}>
            <Target size={16} />

            <span>
              Goal: {goalLabel}
            </span>
          </div>

          <div style={extraStyles.profileChip}>
            <Leaf size={16} />

            <span>
              {diet === "veg"
                ? "Vegetarian"
                : "Mixed Diet Options"}
            </span>
          </div>

          <button
            type="button"
            onClick={syncPreferences}
            style={extraStyles.refreshButton}
          >
            <RefreshCw size={15} />
            Use My Profile
          </button>
        </div>

        {/* MEAL SELECTION CONTROLS */}

        <div className="fvs-advisor-controls">

          {/* SELECT MEAL */}

          <label className="fvs-advisor-field">
            <span>
              <UtensilsCrossed size={15} />
              SELECT YOUR MEAL
            </span>

            <div className="fvs-advisor-select">
              <select
                value={mealType}
                onChange={event =>
                  changeMealType(event.target.value)
                }
              >
                {mealOptions.map(meal => (
                  <option
                    key={meal.value}
                    value={meal.value}
                  >
                    {meal.label}
                  </option>
                ))}
              </select>

              <ChevronDown size={18} />
            </div>
          </label>

          {/* SELECT DIET */}

          <label className="fvs-advisor-field">
            <span>
              <Leaf size={15} />
              DIETARY PREFERENCE
            </span>

            <div className="fvs-advisor-select">
              <select
                value={diet}
                onChange={event =>
                  changeDiet(event.target.value)
                }
              >
                <option value="veg">
                  Vegetarian
                </option>

                <option value="nonveg">
                  Non-Vegetarian
                </option>
              </select>

              <ChevronDown size={18} />
            </div>
          </label>
        </div>

        {/* GENERATE BUTTON */}

        <div className="fvs-advisor-action">
          <div className="fvs-advisor-tip">
            <Sparkles size={18} />

            <span>
              Suggestions are personalized using
              your selected meal, dietary preference,
              and fitness goal.
            </span>
          </div>

          <button
            type="button"
            className="fvs-generate-button"
            onClick={handleGenerate}
            disabled={!mealData}
          >
            <Sparkles size={18} />
            GENERATE MY MEAL
            <ArrowRight size={18} />
          </button>
        </div>

        {/* NO MENU AVAILABLE */}

        {!mealData && (
          <div className="fvs-advisor-empty">
            <AlertTriangle size={19} />

            Menu information is not available
            for this selection.
          </div>
        )}

        {/* ====================================
            RECOMMENDATION RESULTS
        ==================================== */}

        {showResult && recommendation && (
          <div className="fvs-result">

            {/* RESULT HEADER */}

            <div className="fvs-result-heading">
              <div className="fvs-result-heading-icon">
                <Salad size={27} />
              </div>

              <div>
                <span>
                  YOUR PERSONALIZED MEAL INSPIRATION
                </span>

                <h3>
                  Suggested Food Combination
                </h3>

                <p>
                  Based on your selected campus
                  menu and fitness preferences.
                </p>
              </div>

              <CheckCircle2
                size={23}
                className="fvs-result-check"
              />
            </div>

            {/* FITNESS GOAL EXPLANATION */}

            <div style={extraStyles.goalBox}>
              <div style={extraStyles.goalLabel}>
                <Target size={16} />
                YOUR FITNESS FOCUS
              </div>

              <h4 style={extraStyles.goalTitle}>
                {recommendation.fitnessGoalLabel}
              </h4>

              <p style={extraStyles.goalDescription}>
                {recommendation.explanations?.[0] ||
                  "A varied eating pattern supports everyday wellbeing."}
              </p>
            </div>

            {/* SUGGESTED FOODS */}

            <div className="fvs-result-section">
              <div className="fvs-result-label">
                <Leaf size={16} />
                FOODS TO CONSIDER
              </div>

              {recommendation.suggestedFoods.length > 0 ? (
                <div className="fvs-food-grid">
                  {recommendation.suggestedFoods.map(
                    (food, index) => (
                      <div
                        className="fvs-food-card"
                        key={`${food}-${index}`}
                      >
                        <div className="fvs-food-icon">
                          <CheckCircle2 size={17} />
                        </div>

                        <span>{food}</span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="fvs-result-empty">
                  No matching foods were identified.
                  Explore the full menu and ask
                  mess staff about suitable options.
                </p>
              )}
            </div>

            {/* EXPLANATION CARDS */}

            <div className="fvs-info-grid">

              {/* REASONING */}

              <div className="fvs-info-card">
                <div className="fvs-info-title">
                  <div className="fvs-info-icon">
                    <Lightbulb size={21} />
                  </div>

                  <div>
                    <span>
                      EXPLAINABLE RECOMMENDATIONS
                    </span>

                    <h4>Why These Foods?</h4>
                  </div>
                </div>

                {recommendation.explanations.length > 1 ? (
                  recommendation.explanations
                    .slice(1)
                    .map((text, index) => (
                      <div
                        className="fvs-info-item"
                        key={index}
                      >
                        <CheckCircle2 size={16} />
                        <p>{text}</p>
                      </div>
                    ))
                ) : (
                  <p className="fvs-result-empty">
                    Explore different food groups
                    and choose foods you enjoy.
                  </p>
                )}
              </div>

              {/* ADDITIONAL FOODS */}

              <div className="fvs-info-card">
                <div className="fvs-info-title">
                  <div className="fvs-info-icon">
                    <Leaf size={21} />
                  </div>

                  <div>
                    <span>
                      MORE POSSIBILITIES
                    </span>

                    <h4>Additional Food Ideas</h4>
                  </div>
                </div>

                {recommendation.additionalFoods.length > 0 ? (
                  recommendation.additionalFoods.map(
                    (text, index) => (
                      <div
                        className="fvs-info-item"
                        key={index}
                      >
                        <CheckCircle2 size={16} />
                        <p>{text}</p>
                      </div>
                    )
                  )
                ) : (
                  <div className="fvs-info-item">
                    <CheckCircle2 size={16} />

                    <p>
                      Choose a variety of foods
                      you enjoy from your menu.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* PERSONALIZED INSIGHTS */}

            {recommendation.personalizedInsights?.length > 0 && (
              <div style={extraStyles.insightSection}>
                <h4 style={extraStyles.insightTitle}>
                  <HeartPulse size={19} />
                  Personalized Wellness Insights
                </h4>

                {recommendation.personalizedInsights.map(
                  (insight, index) => (
                    <div
                      key={index}
                      style={extraStyles.insightItem}
                    >
                      <CheckCircle2
                        size={16}
                        style={{
                          flexShrink: 0,
                          marginTop: 3,
                          color: "#b8f548"
                        }}
                      />

                      <span>{insight}</span>
                    </div>
                  )
                )}
              </div>
            )}

            {/* SAFETY NOTICE */}

            <div className="fvs-safety-note">
              <div className="fvs-safety-icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <strong>
                  A NOTE ABOUT YOUR FOOD CHOICES
                </strong>

                <p>
                  {recommendation.notice}
                </p>
              </div>
            </div>

            {/* INFORMATION NOTE */}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginTop: 15,
                color: "#a9bea8",
                fontSize: 11,
                lineHeight: 1.7
              }}
            >
              <Info
                size={16}
                style={{ flexShrink: 0 }}
              />

              <span>
                These are optional food-group
                suggestions. They are not a
                prescribed meal plan, and food
                names do not establish ingredient
                or allergen safety.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="fvs-advisor-footer">
        <span>
          <Sparkles size={15} />
          POWERED BY FITVERSE RECOMMENDATIONS
        </span>

        <span>
          <Leaf size={15} />
          YOUR CHOICES, YOUR PACE
        </span>
      </div>
    </section>
  );
}

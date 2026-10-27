
import { useEffect, useState } from "react";

import {
  CalendarDays,
  Clock3,
  Coffee,
  Sun,
  Sunset,
  Moon,
  UtensilsCrossed,
  ChefHat,
  Leaf,
  Sparkles,
  MapPin,
  ChevronDown,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

import { messData } from "../data/messData";
import { messDataV2 } from "../data/messDataV2";
import SmartRecommendation from "./SmartRecommendation";

import "../FitVersePages.css";

/* ==========================================
   FITVERSE AI — MESS MENU
========================================== */

const PROFILE_STORAGE_KEY =
  "fitverse-student-profile";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const mealTypes = [
  {
    key: "breakfast",
    title: "Breakfast",
    subtitle: "Start your day",
    icon: Coffee,
    number: "01",
    fallbackTime: "Morning"
  },
  {
    key: "lunch",
    title: "Lunch",
    subtitle: "Midday fuel",
    icon: Sun,
    number: "02",
    fallbackTime: "Afternoon"
  },
  {
    key: "snacks",
    title: "Evening Snacks",
    subtitle: "Afternoon break",
    icon: Sunset,
    number: "03",
    fallbackTime: "Evening"
  },
  {
    key: "dinner",
    title: "Dinner",
    subtitle: "Evening meal",
    icon: Moon,
    number: "04",
    fallbackTime: "Night"
  }
];

/* ==========================================
   LOAD STUDENT PROFILE
========================================== */

function loadProfilePreferences() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(
        PROFILE_STORAGE_KEY
      ) || "{}"
    );

    return {
      hostel:
        saved.hostel === "girls"
          ? "girls"
          : "boys",

      messType: [
        "veg",
        "nonveg",
        "special"
      ].includes(saved.messType)
        ? saved.messType
        : "veg"
    };
  } catch {
    return {
      hostel: "boys",
      messType: "veg"
    };
  }
}

/* ==========================================
   GET CURRENT DAY
========================================== */

function getInitialDay() {
  const today = new Date().getDay();

  return days[(today + 6) % 7];
}

/* ==========================================
   NORMALIZE MEAL CONTENT
========================================== */

function getMealContent(mealData) {
  if (!mealData) {
    return {
      items: [],
      vegOptions: [],
      nonVegOptions: [],
      time: ""
    };
  }

  if (Array.isArray(mealData)) {
    return {
      items: mealData,
      vegOptions: [],
      nonVegOptions: [],
      time: ""
    };
  }

  return {
    items: Array.isArray(mealData.items)
      ? mealData.items
      : [],

    vegOptions: Array.isArray(
      mealData.vegOptions
    )
      ? mealData.vegOptions
      : [],

    nonVegOptions: Array.isArray(
      mealData.nonVegOptions
    )
      ? mealData.nonVegOptions
      : [],

    time: mealData.time || ""
  };
}

/* ==========================================
   FOOD GROUP COMPONENT
========================================== */

function FoodGroup({ title, items }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="fvp-food-group">
      {title && (
        <h4 className="fvp-food-group-title">
          {title}
        </h4>
      )}

      <div className="fvp-food-items">
        {items.map((food, index) => (
          <div
            className="fvp-food-item"
            key={`${food}-${index}`}
          >
            <span className="fvp-food-dot" />

            <span>{food}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   MAIN MESS MENU COMPONENT
========================================== */

export default function MessMenu() {
  const [preferences, setPreferences] =
    useState(loadProfilePreferences);

  const [hostel, setHostel] = useState(
    preferences.hostel
  );

  const [messType, setMessType] = useState(
    preferences.messType
  );

  const [day, setDay] = useState(
    getInitialDay
  );

  const [
    profileSynced,
    setProfileSynced
  ] = useState(true);

  /* ========================================
     SYNC WITH STUDENT PROFILE
  ======================================== */

  function syncWithProfile() {
    const updated =
      loadProfilePreferences();

    setPreferences(updated);
    setHostel(updated.hostel);
    setMessType(updated.messType);
    setProfileSynced(true);
  }

  useEffect(() => {
    function handleStorageChange(event) {
      if (
        !event.key ||
        event.key === PROFILE_STORAGE_KEY
      ) {
        syncWithProfile();
      }
    }

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "fitverse-profile-updated",
      syncWithProfile
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "fitverse-profile-updated",
        syncWithProfile
      );
    };
  }, []);

  /* ========================================
     HOSTEL SELECTION
  ======================================== */

  function changeHostel(value) {
    setHostel(value);
    setProfileSynced(false);
  }

  /* ========================================
     MESS CATEGORY SELECTION
  ======================================== */

  function changeMessType(value) {
    setMessType(value);
    setProfileSynced(false);
  }

  /* ========================================
     SELECTED MENU DATA
  ======================================== */

  const selectedMenu =
    messDataV2[hostel]?.[messType]?.[day] ??
    messData[hostel]?.[messType]?.[day];

  const availableMeals =
    mealTypes.filter(
      meal => selectedMenu?.[meal.key]
    ).length;

  const selectedCategory =
    messType === "veg"
      ? "Vegetarian"
      : messType === "nonveg"
      ? "Non-Vegetarian"
      : "Special";

  /*
    Special mess uses the saved profile's
    vegetarian preference when available.
    All displayed food names still require
    ingredient verification.
  */

  const selectedDiet =
    messType === "veg"
      ? "veg"
      : messType === "nonveg"
      ? "nonveg"
      : preferences.messType === "veg"
      ? "veg"
      : "nonveg";

  /* ========================================
     MAIN UI
  ======================================== */

  return (
    <div className="fvp-mess-page">

      {/* =====================================
          HERO SECTION
      ===================================== */}

      <section className="fvp-page-hero">
        <div className="fvp-hero-copy">
          <div className="fvp-section-label">
            <span className="fvp-pulse-dot" />

            FITVERSE NUTRITION HUB
          </div>

          <h2>
            EAT WELL.
            <br />
            <span>FEEL READY.</span>
          </h2>

          <p>
            Your campus dining companion.
            Explore hostel mess menus,
            discover your meal options,
            and make food choices that
            work for your routine.
          </p>

          <div className="fvp-hero-chips">
            <span>
              <MapPin size={15} />
              VIT CAMPUS
            </span>

            <span>
              <CalendarDays size={15} />
              7-DAY MENU
            </span>

            <span>
              <Leaf size={15} />
              FOOD CHOICES
            </span>
          </div>
        </div>

        <div className="fvp-hero-art">
          <div className="fvp-art-ring">
            <ChefHat
              size={82}
              strokeWidth={1.3}
            />
          </div>

          <span>FUEL YOUR DAY</span>
        </div>
      </section>

      {/* =====================================
          DINING PREFERENCES
      ===================================== */}

      <section className="fvp-section">
        <div className="fvp-section-heading">
          <div>
            <span className="fvp-eyebrow">
              PERSONALIZE YOUR MENU
            </span>

            <h3>Dining Preferences</h3>

            <p>
              Your saved profile preferences
              are selected automatically.
            </p>
          </div>

          <div className="fvp-heading-icon">
            <UtensilsCrossed size={22} />
          </div>
        </div>

        {/* FILTER GRID */}

        <div className="fvp-filter-grid">

          {/* HOSTEL LOCATION */}

          <label className="fvp-select-field">
            <span>
              HOSTEL LOCATION
            </span>

            <div className="fvp-select-wrap">
              <MapPin size={19} />

              <select
                value={hostel}
                onChange={event =>
                  changeHostel(
                    event.target.value
                  )
                }
              >
                <option value="boys">
                  Boys Hostel
                </option>

                <option value="girls">
                  Girls Hostel
                </option>
              </select>

              <ChevronDown
                size={18}
                className="fvp-select-chevron"
              />
            </div>
          </label>

          {/* MESS CATEGORY */}

          <label className="fvp-select-field">
            <span>
              MESS CATEGORY
            </span>

            <div className="fvp-select-wrap">
              <Leaf size={19} />

              <select
                value={messType}
                onChange={event =>
                  changeMessType(
                    event.target.value
                  )
                }
              >
                <option value="veg">
                  Vegetarian
                </option>

                <option value="nonveg">
                  Non-Vegetarian
                </option>

                <option value="special">
                  Special
                </option>
              </select>

              <ChevronDown
                size={18}
                className="fvp-select-chevron"
              />
            </div>
          </label>
        </div>

        {/* PROFILE SYNC STATUS */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 18,
            padding: "14px 16px",
            border: "1px solid #38523b",
            borderRadius: 11,
            background: "#1b2d20"
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: "#c3d7bf",
              fontSize: 12
            }}
          >
            <CheckCircle2
              size={17}
              color="#b7f34a"
            />

            {profileSynced
              ? "Showing your saved profile preferences"
              : "Custom menu selection — profile unchanged"}
          </span>

          <button
            type="button"
            onClick={syncWithProfile}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 13px",
              border: "1px solid #5a7c4b",
              borderRadius: 9,
              background: "#2b4429",
              color: "#b7f34a",
              fontWeight: 800,
              fontSize: 11,
              cursor: "pointer"
            }}
          >
            <RefreshCw size={15} />

            Use My Profile
          </button>
        </div>
      </section>

      {/* =====================================
          WEEKLY DINING CALENDAR
      ===================================== */}

      <section className="fvp-section">
        <div className="fvp-section-heading">
          <div>
            <span className="fvp-eyebrow">
              PLAN YOUR WEEK
            </span>

            <h3>
              Weekly Dining Calendar
            </h3>

            <p>
              Choose a day to explore
              the available meals.
            </p>
          </div>

          <div className="fvp-heading-icon">
            <CalendarDays size={22} />
          </div>
        </div>

        {/* DAY BUTTONS */}

        <div className="fvp-day-grid">
          {days.map((item, index) => (
            <button
              key={item}
              type="button"
              className={
                day === item
                  ? "fvp-day-card active"
                  : "fvp-day-card"
              }
              onClick={() => setDay(item)}
            >
              <span>
                DAY 0{index + 1}
              </span>

              <strong>
                {item.slice(0, 3)}
              </strong>

              <span className="fvp-day-indicator" />
            </button>
          ))}
        </div>

        {/* MENU SUMMARY */}

        <div className="fvp-menu-summary">
          <div>
            <span className="fvp-eyebrow">
              SELECTED DINING PLAN
            </span>

            <h3>{day}'s Menu</h3>

            <p>
              {hostel === "boys"
                ? "Boys Hostel"
                : "Girls Hostel"}

              {" · "}

              {selectedCategory}
            </p>
          </div>

          <div className="fvp-summary-count">
            <strong>
              {availableMeals}
            </strong>

            <span>
              MEAL SECTIONS
            </span>
          </div>
        </div>
      </section>

      {/* =====================================
          DAILY MEAL CARDS
      ===================================== */}

      <section className="fvp-section">
        <div className="fvp-section-heading">
          <div>
            <span className="fvp-eyebrow">
              WHAT'S ON THE MENU
            </span>

            <h3>
              Today's Dining Lineup
            </h3>

            <p>
              Browse the meals listed
              for your selected day.
            </p>
          </div>

          <div className="fvp-heading-icon">
            <Sparkles size={22} />
          </div>
        </div>

        {/* MEAL GRID */}

        <div className="fvp-meal-grid">
          {mealTypes.map(meal => {
            const Icon = meal.icon;

            const mealData =
              selectedMenu?.[meal.key];

            const content =
              getMealContent(mealData);

            const totalItems =
              content.items.length +
              content.vegOptions.length +
              content.nonVegOptions.length;

            return (
              <article
                className="fvp-meal-card"
                key={meal.key}
              >

                {/* CARD TOP */}

                <div className="fvp-meal-card-top">
                  <div className="fvp-meal-icon">
                    <Icon size={26} />
                  </div>

                  <span className="fvp-meal-number">
                    MEAL {meal.number}
                  </span>
                </div>

                {/* MEAL TITLE */}

                <div className="fvp-meal-title">
                  <div>
                    <span>
                      {meal.subtitle}
                    </span>

                    <h4>
                      {meal.title}
                    </h4>
                  </div>

                  <UtensilsCrossed
                    size={20}
                    className="fvp-meal-decoration"
                  />
                </div>

                {/* MEAL META */}

                <div className="fvp-meal-meta">
                  <span>
                    <Clock3 size={15} />

                    {content.time ||
                      meal.fallbackTime}
                  </span>

                  <span>
                    <CheckCircle2 size={15} />

                    {totalItems} items
                  </span>
                </div>

                <div className="fvp-meal-divider" />

                {/* FOOD LIST */}

                {mealData ? (
                  <div className="fvp-meal-content">
                    <FoodGroup
                      title=""
                      items={content.items}
                    />

                    <FoodGroup
                      title="VEGETARIAN OPTIONS"
                      items={content.vegOptions}
                    />

                    <FoodGroup
                      title="NON-VEGETARIAN OPTIONS"
                      items={content.nonVegOptions}
                    />

                    {totalItems === 0 && (
                      <p className="fvp-empty-menu">
                        No food items listed
                        for this meal.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="fvp-empty-menu">
                    Menu data has not been
                    added for this selection yet.
                  </p>
                )}

                {/* CARD FOOTER */}

                <div className="fvp-meal-card-footer">
                  <span className="fvp-pulse-dot" />

                  CAMPUS DINING
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =====================================
          SMART MEAL RECOMMENDATIONS
          SINGLE RECOMMENDATION SECTION
      ===================================== */}

      <section className="fvp-recommendations">
        <div className="fvp-section-heading">
          <div>
            <span className="fvp-eyebrow">
              FITVERSE SMART SUGGESTIONS
            </span>

            <h3>
              Personalized Meal Recommendations
            </h3>

            <p>
              Explore meal suggestions
              personalized to your fitness
              goal and dietary preferences.
            </p>
          </div>

          <div className="fvp-heading-icon">
            <Sparkles size={22} />
          </div>
        </div>

        <div className="fvp-recommendation-content">
          <SmartRecommendation
            key={`${hostel}-${messType}-${day}`}
            selectedMenu={selectedMenu}
            selectedDiet={selectedDiet}
          />
        </div>
      </section>

      {/* =====================================
          FOOTER NOTICE
      ===================================== */}

      <p className="fvp-page-note">
        <Leaf size={17} />

        Mess menus may change depending
        on hostel operations and availability.
        Confirm current menu details,
        ingredients and dietary suitability
        with campus mess staff.
      </p>
    </div>
  );
}

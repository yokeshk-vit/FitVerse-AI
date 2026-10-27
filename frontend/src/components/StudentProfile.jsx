
import { useEffect, useState } from "react";

import {
  UserRound,
  Save,
  CheckCircle2,
  GraduationCap,
  House,
  Utensils,
  Dumbbell,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  HeartPulse,
  MapPin,
  BadgeCheck,
  Settings2,
  IdCard,
  Ruler,
  Scale,
  Target,
  Clock3,
  Activity,
  Info,
  Zap,
  RotateCcw
} from "lucide-react";

import { profileAPI } from "../services/api";

import "../FitVersePages.css";

/*
========================================
FITVERSE AI — STUDENT PROFILE
MongoDB-connected version
========================================
*/

const STORAGE_KEY = "fitverse-student-profile";

const defaultProfile = {
  name: "",
  department: "",
  hostel: "boys",
  messType: "veg",
  workoutLevel: "beginner",
  fitnessGoal: "general",
  workoutDuration: "20",
  height: "",
  weight: ""
};

const goalOptions = [
  {
    value: "general",
    label: "General Fitness",
    description:
      "Build a balanced routine with movement, strength and recovery."
  },
  {
    value: "strength",
    label: "Build Strength",
    description:
      "Focus on comfortable, progressive strength exercises."
  },
  {
    value: "endurance",
    label: "Improve Endurance",
    description:
      "Develop stamina with manageable activity sessions."
  },
  {
    value: "flexibility",
    label: "Flexibility & Mobility",
    description:
      "Focus on mobility, flexibility and movement quality."
  }
];

function normalizeProfile(data = {}) {
  return {
    name: data.name || "",
    department: data.department || "",
    hostel: data.hostel || "boys",
    messType: data.messType || "veg",
    workoutLevel: data.workoutLevel || "beginner",
    fitnessGoal: data.fitnessGoal || "general",
    workoutDuration:
      data.workoutDuration == null
        ? "20"
        : String(data.workoutDuration),
    height:
      data.height == null
        ? ""
        : String(data.height),
    weight:
      data.weight == null
        ? ""
        : String(data.weight)
  };
}

function getHostelLabel(hostel) {
  return hostel === "girls"
    ? "Girls Hostel"
    : "Boys Hostel";
}

function getMessLabel(type) {
  if (type === "nonveg") return "Non-Vegetarian";
  if (type === "special") return "Special";
  return "Vegetarian";
}

function getWorkoutLabel(level) {
  if (level === "advanced") return "Advanced";
  if (level === "intermediate") return "Intermediate";
  return "Beginner";
}

function getGoalLabel(goal) {
  return (
    goalOptions.find(item => item.value === goal)
      ?.label || "General Fitness"
  );
}

function getRecommendation(profile) {
  const recommendations = {
    general: {
      title: "Balanced Fitness Routine",
      focus:
        "A combination of strength, light cardio, mobility and recovery.",
      activities: [
        "Bodyweight strength movements",
        "Comfortable walking or cardio",
        "Mobility and stretching"
      ]
    },

    strength: {
      title: "Progressive Strength Routine",
      focus:
        "Build movement confidence and strength through controlled exercises.",
      activities: [
        "Squats or supported squats",
        "Wall or incline push-ups",
        "Core stability movements"
      ]
    },

    endurance: {
      title: "Endurance & Stamina Routine",
      focus:
        "Develop cardiovascular endurance at a comfortable pace.",
      activities: [
        "Brisk walking or marching",
        "Low-impact cardio intervals",
        "Gentle recovery movements"
      ]
    },

    flexibility: {
      title: "Mobility & Flexibility Routine",
      focus:
        "Improve movement quality with gentle mobility exercises.",
      activities: [
        "Shoulder and hip mobility",
        "Gentle full-body stretches",
        "Balance and posture exercises"
      ]
    }
  };

  const selected =
    recommendations[profile.fitnessGoal] ||
    recommendations.general;

  return {
    ...selected,
    duration: Number(profile.workoutDuration),
    level: getWorkoutLabel(profile.workoutLevel),
    note:
      profile.workoutLevel === "beginner"
        ? "Start with comfortable variations and build gradually."
        : "Choose variations that feel controlled and allow recovery."
  };
}

function calculateBMI(height, weight) {
  if (height === "" || weight === "") {
    return null;
  }

  const heightCm = Number(height);
  const weightKg = Number(weight);

  if (
    !Number.isFinite(heightCm) ||
    !Number.isFinite(weightKg) ||
    heightCm <= 0 ||
    weightKg <= 0
  ) {
    return null;
  }

  const heightM = heightCm / 100;

  return weightKg / (heightM * heightM);
}

function notifyProfileUpdated(profile) {
  // Compatibility cache for the existing workout
  // generator and mess recommendation components.
  // MongoDB remains the authoritative profile source.
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(profile)
  );

  window.dispatchEvent(
    new Event("fitverse-profile-updated")
  );
}

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    ...defaultProfile
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  /*
  ========================================
  LOAD PROFILE FROM MONGODB
  ========================================
  */

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      setError("");

      try {
        const response = await profileAPI.get();

        if (cancelled) return;

        if (!response.success) {
          throw new Error(
            "Unable to load your student profile."
          );
        }

        const loadedProfile = normalizeProfile(
          response.profile || {}
        );

        setProfile(loadedProfile);

        // Only synchronize the cache when a
        // saved server profile actually exists.
        if (response.profile) {
          notifyProfileUpdated(loadedProfile);
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err.message ||
            "Unable to load your profile."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  ========================================
  FORM CHANGES
  ========================================
  */

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile(previous => ({
      ...previous,
      [name]: value
    }));

    setSaved(false);
    setError("");
  }

  /*
  ========================================
  SAVE PROFILE TO MONGODB
  ========================================
  */

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving || loading) return;

    const name = profile.name.trim();
    const department = profile.department.trim();

    if (!name) {
      setError("Please enter your student name.");
      return;
    }

    if (!department) {
      setError("Please enter your department.");
      return;
    }

    const height = String(profile.height).trim();
    const weight = String(profile.weight).trim();

    if (
      height &&
      (
        !Number.isFinite(Number(height)) ||
        Number(height) <= 0 ||
        Number(height) > 300
      )
    ) {
      setError(
        "Enter a valid height or leave it blank."
      );
      return;
    }

    if (
      weight &&
      (
        !Number.isFinite(Number(weight)) ||
        Number(weight) <= 0 ||
        Number(weight) > 500
      )
    ) {
      setError(
        "Enter a valid weight or leave it blank."
      );
      return;
    }

    const profileData = {
      name,
      department,
      hostel: profile.hostel,
      messType: profile.messType,
      workoutLevel: profile.workoutLevel,
      fitnessGoal: profile.fitnessGoal,
      workoutDuration: Number(
        profile.workoutDuration
      ),
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null
    };

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await profileAPI.save(
        profileData
      );

      if (!response.success || !response.profile) {
        throw new Error(
          "Profile could not be saved."
        );
      }

      const updatedProfile = normalizeProfile(
        response.profile
      );

      setProfile(updatedProfile);

      // Update existing frontend components only
      // after the backend confirms the save.
      try {
        notifyProfileUpdated(updatedProfile);
      } catch {
        // The server save succeeded.
        // Local cache can be rebuilt later.
      }

      setSaved(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  ========================================
  PROFILE PREVIEW DATA
  ========================================
  */

  const displayName =
    profile.name.trim() || "FitVerse Student";

  const initials = profile.name.trim()
    ? profile.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : "FV";

  const recommendation = getRecommendation(profile);

  const bmi = calculateBMI(
    profile.height,
    profile.weight
  );

  const sectionNoteStyle = {
    marginTop: 14,
    padding: "13px 15px",
    border: "1px solid #38563b",
    borderRadius: 10,
    background: "#192d1e",
    color: "#b8cbb5",
    fontSize: 12,
    lineHeight: 1.8
  };

  const fieldStyle = {
    width: "100%",
    minHeight: 45,
    padding: "12px 14px",
    border: "1px solid #3b5840",
    borderRadius: 9,
    background: "#1c3021",
    color: "#f5f9f1",
    fontSize: 13,
    outline: "none"
  };

  /*
  ========================================
  LOADING SCREEN
  ========================================
  */

  if (loading) {
    return (
      <div
        className="fvp-profile-page"
        style={{
          minHeight: 300,
          display: "grid",
          placeItems: "center",
          color: "#d5edcb"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Activity size={38} />

          <h3>Loading your profile...</h3>

          <p>
            Connecting to FitVerse AI.
          </p>
        </div>
      </div>
    );
  }

  /*
  ========================================
  PROFILE PAGE
  ========================================
  */

  return (
    <div className="fvp-profile-page">

      {/* PROFILE HERO */}

      <section className="fvp-page-hero fvp-profile-hero">

        <div className="fvp-hero-copy">

          <div className="fvp-section-label">
            <span className="fvp-pulse-dot" />
            FITVERSE PERSONAL SPACE
          </div>

          <h2>
            YOUR SPACE.
            <br />
            <span>YOUR JOURNEY.</span>
          </h2>

          <p>
            Personalize your campus dining,
            workout experience and fitness goals.
            Build a balanced wellness routine
            that works for you.
          </p>

          <div className="fvp-hero-chips">
            <span>
              <ShieldCheck size={15} />
              ACCOUNT CONNECTED
            </span>

            <span>
              <HeartPulse size={15} />
              PERSONALIZED
            </span>

            <span>
              <Sparkles size={15} />
              FITVERSE AI
            </span>
          </div>

        </div>

        <div className="fvp-hero-art">
          <div className="fvp-art-ring">
            <UserRound
              size={82}
              strokeWidth={1.3}
            />
          </div>

          <span>YOUR FITNESS IDENTITY</span>
        </div>

      </section>

      <div className="fvp-profile-layout">

        {/* PROFILE FORM */}

        <form
          className="fvp-profile-form"
          onSubmit={handleSubmit}
        >

          <div className="fvp-section-heading">

            <div>
              <span className="fvp-eyebrow">
                PERSONAL SETTINGS
              </span>

              <h3>Manage Your Profile</h3>

              <p>
                Your information, preferences
                and fitness goals.
              </p>
            </div>

            <div className="fvp-heading-icon">
              <Settings2 size={22} />
            </div>

          </div>

          {/* PERSONAL INFORMATION */}

          <div className="fvp-form-section">

            <div className="fvp-form-section-title">

              <div className="fvp-form-section-icon">
                <IdCard size={20} />
              </div>

              <div>
                <h4>Personal Information</h4>
                <p>Your student identity</p>
              </div>

            </div>

            <div className="fvp-form-fields">

              <label className="fvp-form-field">
                <span>
                  <UserRound size={16} />
                  STUDENT NAME
                </span>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={profile.name}
                  onChange={handleChange}
                  maxLength={60}
                  disabled={saving}
                  required
                />
              </label>

              <label className="fvp-form-field">
                <span>
                  <GraduationCap size={16} />
                  DEPARTMENT
                </span>

                <input
                  type="text"
                  name="department"
                  placeholder="Example: Computer Science"
                  value={profile.department}
                  onChange={handleChange}
                  maxLength={80}
                  disabled={saving}
                  required
                />
              </label>

            </div>

          </div>

          {/* CAMPUS PREFERENCES */}

          <div className="fvp-form-section">

            <div className="fvp-form-section-title">

              <div className="fvp-form-section-icon">
                <House size={20} />
              </div>

              <div>
                <h4>Campus Preferences</h4>
                <p>Hostel and mess category</p>
              </div>

            </div>

            <div className="fvp-form-fields">

              <label className="fvp-form-field">
                <span>
                  <MapPin size={16} />
                  HOSTEL
                </span>

                <div className="fvp-form-select">
                  <select
                    name="hostel"
                    value={profile.hostel}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="boys">
                      Boys Hostel
                    </option>

                    <option value="girls">
                      Girls Hostel
                    </option>
                  </select>

                  <ChevronDown size={18} />
                </div>
              </label>

              <label className="fvp-form-field">
                <span>
                  <Utensils size={16} />
                  MESS CATEGORY
                </span>

                <div className="fvp-form-select">
                  <select
                    name="messType"
                    value={profile.messType}
                    onChange={handleChange}
                    disabled={saving}
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

                  <ChevronDown size={18} />
                </div>
              </label>

            </div>

          </div>

          {/* FITNESS PREFERENCES */}

          <div className="fvp-form-section">

            <div className="fvp-form-section-title">

              <div className="fvp-form-section-icon">
                <Dumbbell size={20} />
              </div>

              <div>
                <h4>Fitness Preferences</h4>
                <p>
                  Personalize your workout experience
                </p>
              </div>

            </div>

            <div className="fvp-form-fields">

              <label className="fvp-form-field">
                <span>
                  <Dumbbell size={16} />
                  EXPERIENCE LEVEL
                </span>

                <div className="fvp-form-select">
                  <select
                    name="workoutLevel"
                    value={profile.workoutLevel}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="beginner">
                      Beginner
                    </option>

                    <option value="intermediate">
                      Intermediate
                    </option>

                    <option value="advanced">
                      Advanced
                    </option>
                  </select>

                  <ChevronDown size={18} />
                </div>
              </label>

              <label className="fvp-form-field">
                <span>
                  <Target size={16} />
                  FITNESS GOAL
                </span>

                <div className="fvp-form-select">
                  <select
                    name="fitnessGoal"
                    value={profile.fitnessGoal}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    {goalOptions.map(goal => (
                      <option
                        key={goal.value}
                        value={goal.value}
                      >
                        {goal.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={18} />
                </div>
              </label>

              <label className="fvp-form-field">
                <span>
                  <Clock3 size={16} />
                  PREFERRED WORKOUT DURATION
                </span>

                <div className="fvp-form-select">
                  <select
                    name="workoutDuration"
                    value={profile.workoutDuration}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="15">
                      15 Minutes
                    </option>

                    <option value="20">
                      20 Minutes
                    </option>

                    <option value="30">
                      30 Minutes
                    </option>
                  </select>

                  <ChevronDown size={18} />
                </div>
              </label>

            </div>

            <div style={sectionNoteStyle}>
              <Sparkles
                size={16}
                style={{
                  display: "inline",
                  marginRight: 8,
                  verticalAlign: "middle",
                  color: "#b8f548"
                }}
              />

              {
                goalOptions.find(
                  goal =>
                    goal.value === profile.fitnessGoal
                )?.description
              }
            </div>

          </div>

          {/* OPTIONAL MEASUREMENTS */}

          <div className="fvp-form-section">

            <div className="fvp-form-section-title">

              <div className="fvp-form-section-icon">
                <Activity size={20} />
              </div>

              <div>
                <h4>Optional Measurements</h4>
                <p>Personal reference information</p>
              </div>

            </div>

            <div className="fvp-form-fields">

              <label className="fvp-form-field">
                <span>
                  <Ruler size={16} />
                  HEIGHT (CM) — OPTIONAL
                </span>

                <input
                  type="number"
                  name="height"
                  value={profile.height}
                  onChange={handleChange}
                  placeholder="Example: 165"
                  min="1"
                  max="300"
                  step="0.1"
                  style={fieldStyle}
                  disabled={saving}
                />
              </label>

              <label className="fvp-form-field">
                <span>
                  <Scale size={16} />
                  WEIGHT (KG) — OPTIONAL
                </span>

                <input
                  type="number"
                  name="weight"
                  value={profile.weight}
                  onChange={handleChange}
                  placeholder="Example: 60"
                  min="1"
                  max="500"
                  step="0.1"
                  style={fieldStyle}
                  disabled={saving}
                />
              </label>

            </div>

            <div style={sectionNoteStyle}>
              <Info
                size={17}
                style={{
                  display: "inline",
                  marginRight: 8,
                  verticalAlign: "middle",
                  color: "#b8f548"
                }}
              />

              Height and weight are optional.
              FitVerse does not use these measurements
              to judge your body or automatically
              recommend weight changes.

              {bmi !== null && (
                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#d5edcb"
                  }}
                >
                  <strong>
                    BMI calculation:{" "}
                    {bmi.toFixed(1)}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: 5
                    }}
                  >
                    BMI alone cannot determine
                    someone's health or fitness needs.
                    For adolescents, interpretation
                    requires age- and sex-specific
                    growth references.
                  </span>
                </p>
              )}
            </div>

          </div>

          {/* SAVE PROFILE */}

          <button
            type="submit"
            className="fvp-save-button"
            disabled={saving}
          >
            <Save size={19} />

            {saving
              ? "SAVING TO FITVERSE..."
              : "SAVE MY PROFILE"}
          </button>

          {saved && (
            <div
              className="fvp-save-success"
              role="status"
            >
              <CheckCircle2 size={20} />

              Profile saved successfully
              to your FitVerse AI account!
            </div>
          )}

          {error && (
            <div
              role="alert"
              style={{
                padding: 14,
                marginTop: 14,
                border: "1px solid #98534b",
                borderRadius: 10,
                background: "#39211f",
                color: "#ffbbb2",
                fontSize: 12
              }}
            >
              {error}
            </div>
          )}

        </form>

        {/* RIGHT PROFILE PREVIEW */}

        <div className="fvp-profile-side">

          <section className="fvp-profile-identity">

            <div className="fvp-identity-top">
              <span>
                <Sparkles size={16} />
                FITVERSE MEMBER
              </span>

              <BadgeCheck size={23} />
            </div>

            <div className="fvp-profile-avatar">
              {initials}
            </div>

            <h3>{displayName}</h3>

            <p>
              {profile.department.trim() ||
                "VIT Student"}
            </p>

            <div className="fvp-identity-divider" />

            <div className="fvp-identity-info">

              <div>
                <span>
                  <House size={16} />
                  HOSTEL
                </span>

                <strong>
                  {getHostelLabel(profile.hostel)}
                </strong>
              </div>

              <div>
                <span>
                  <Utensils size={16} />
                  MESS CATEGORY
                </span>

                <strong>
                  {getMessLabel(profile.messType)}
                </strong>
              </div>

              <div>
                <span>
                  <Dumbbell size={16} />
                  WORKOUT LEVEL
                </span>

                <strong>
                  {getWorkoutLabel(
                    profile.workoutLevel
                  )}
                </strong>
              </div>

              <div>
                <span>
                  <Target size={16} />
                  FITNESS GOAL
                </span>

                <strong>
                  {getGoalLabel(
                    profile.fitnessGoal
                  )}
                </strong>
              </div>

              <div>
                <span>
                  <Clock3 size={16} />
                  SESSION DURATION
                </span>

                <strong>
                  {profile.workoutDuration} min
                </strong>
              </div>

            </div>

            <div className="fvp-identity-footer">
              <CheckCircle2 size={18} />
              YOUR PERSONAL FITVERSE SPACE
            </div>

          </section>

          {/* FITNESS PREVIEW */}

          <section
            style={{
              padding: 23,
              border: "1px solid #38563b",
              borderRadius: 15,
              background:
                "linear-gradient(145deg, #1d3321, #112017)",
              color: "#f5f9f1"
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 15
              }}
            >
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#304a2a",
                  color: "#b8f548"
                }}
              >
                <Zap size={21} />
              </div>

              <div>
                <span
                  style={{
                    color: "#b8f548",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 1
                  }}
                >
                  SMART FITNESS PREVIEW
                </span>

                <h4
                  style={{
                    margin: "5px 0 0",
                    fontSize: 15
                  }}
                >
                  Your Recommended Focus
                </h4>
              </div>
            </div>

            <h3
              style={{
                margin: "0 0 9px",
                color: "#ffffff",
                fontSize: 20
              }}
            >
              {recommendation.title}
            </h3>

            <p
              style={{
                color: "#b7cdb4",
                fontSize: 12,
                lineHeight: 1.8
              }}
            >
              {recommendation.focus}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                margin: "16px 0"
              }}
            >
              <span
                style={{
                  padding: "7px 10px",
                  borderRadius: 8,
                  background: "#2c4529",
                  color: "#c6f48b",
                  fontSize: 11,
                  fontWeight: 800
                }}
              >
                {recommendation.level}
              </span>

              <span
                style={{
                  padding: "7px 10px",
                  borderRadius: 8,
                  background: "#2c4529",
                  color: "#c6f48b",
                  fontSize: 11,
                  fontWeight: 800
                }}
              >
                {recommendation.duration} min
              </span>
            </div>

            <div
              style={{
                borderTop: "1px solid #38563b",
                paddingTop: 15
              }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: 12,
                  color: "#d8f3ce",
                  fontSize: 12
                }}
              >
                Suggested activities
              </strong>

              {recommendation.activities.map(
                activity => (
                  <div
                    key={activity}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 11,
                      color: "#b7cdb4",
                      fontSize: 12
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      color="#b8f548"
                    />

                    {activity}
                  </div>
                )
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 17,
                padding: 12,
                borderRadius: 9,
                background: "#263e27",
                color: "#c9e5c2",
                fontSize: 11,
                lineHeight: 1.7
              }}
            >
              <RotateCcw
                size={17}
                style={{
                  flexShrink: 0,
                  color: "#b8f548"
                }}
              />

              {recommendation.note}
            </div>

            <p
              style={{
                margin: "15px 0 0",
                color: "#92aa90",
                fontSize: 11,
                lineHeight: 1.7
              }}
            >
              This preview uses your selected
              fitness goal and experience level.
              Your Workout Studio uses these
              preferences when preparing sessions.
            </p>

          </section>

          {/* PRIVACY INFORMATION */}

          <section className="fvp-privacy-card">

            <div className="fvp-privacy-icon">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h4>FitVerse Account Storage</h4>

              <p>
                Your profile is saved to your
                authenticated FitVerse AI account
                in MongoDB Atlas. A temporary
                browser cache also supports existing
                workout and meal features.
                Avoid entering sensitive information
                on shared devices.
              </p>
            </div>

          </section>

        </div>

      </div>
    </div>
  );
}

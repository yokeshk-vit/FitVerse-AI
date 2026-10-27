
import { useEffect, useState } from "react";

import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Flame,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Utensils,
  UserRound,
  X,
  Zap,
  ChartNoAxesColumn
} from "lucide-react";

import {
  loadAdaptiveProgressFromMongoDB
} from "./services/adaptiveProgressSync";

import "./App.css";
import "./FitVerseShell.css";

import AuthPage from "./components/AuthPage";
import MessMenu from "./components/MessMenu";
import WorkoutPlanner from "./components/WorkoutPlanner";
import ProgressTracker from "./components/ProgressTracker";
import StudentProfile from "./components/StudentProfile";
import PersonalizedDashboardCard from "./components/PersonalizedDashboardCard";

import {
  profileAPI,
  clearAccessToken
} from "./services/api";

import {
  loadTrainingState,
  getTrainingSummary
} from "./utils/adaptiveWorkoutEngine";

const PROFILE_KEY = "fitverse-student-profile";
const TRAINING_KEY = "fitverse-adaptive-training-v1";
const BACKUP_KEY = "fitverse-legacy-data-backup";

const MENU_ITEMS = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Workout Planner", icon: Dumbbell },
  { name: "Mess Menu", icon: Utensils },
  { name: "Progress", icon: ChartNoAxesColumn },
  { name: "Profile", icon: UserRound }
];

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function accountKey(id) {
  return `fitverse-account-${encodeURIComponent(id)}-training`;
}

function backupLegacyData() {
  try {
    if (localStorage.getItem(BACKUP_KEY)) return;

    const profile = localStorage.getItem(PROFILE_KEY);
    const training = localStorage.getItem(TRAINING_KEY);

    if (profile || training) {
      localStorage.setItem(
        BACKUP_KEY,
        JSON.stringify({
          profile,
          training,
          savedAt: new Date().toISOString()
        })
      );
    }
  } catch {
    // Browser storage may be unavailable.
  }
}

function clearActiveData() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(TRAINING_KEY);
  } catch {
    // Ignore unavailable browser storage.
  }
}

function saveTraining(id) {
  if (!id) return;

  try {
    const training = localStorage.getItem(TRAINING_KEY);

    if (training !== null) {
      localStorage.setItem(accountKey(id), training);
    }
  } catch {
    // Ignore unavailable browser storage.
  }
}

function restoreTraining(id) {
  try {
    const saved = localStorage.getItem(accountKey(id));

    if (saved !== null) {
      localStorage.setItem(TRAINING_KEY, saved);
    } else {
      localStorage.removeItem(TRAINING_KEY);
    }
  } catch {
    // Ignore unavailable browser storage.
  }

  window.dispatchEvent(new Event("storage"));
}

function getFirstName(profile, user) {
  const name =
    profile?.name ||
    user?.name ||
    "Athlete";

  return name.trim().split(/\s+/)[0];
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
}

function Dashboard({ trainingState, onNavigate }) {
  const summary = getTrainingSummary(trainingState);

  const sessions = trainingState.sessions || [];

  const completedDates = new Set(
    sessions.map(session => session.date).filter(Boolean)
  );

  const today = new Date();

  const dateKey = date =>
    [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");

  let streak = 0;

  const cursor = new Date(today);
  cursor.setHours(12, 0, 0, 0);

  if (!completedDates.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (completedDates.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const stats = [
    {
      label: "CURRENT STREAK",
      value: `${streak} days`,
      icon: Flame,
      detail: "Your recorded workout streak"
    },
    {
      label: "TOTAL SESSIONS",
      value: sessions.length,
      icon: Dumbbell,
      detail: "Workouts recorded"
    },
    {
      label: "ACTIVE DAYS",
      value: completedDates.size,
      icon: CalendarDays,
      detail: "Days with workout activity"
    },
    {
      label: "TRAINING PROGRESS",
      value: "Active",
      icon: TrendingUp,
      detail: "Continue at your own pace"
    }
  ];

  return (
    <div className="fvs-dashboard">

      <PersonalizedDashboardCard
        onOpenWorkout={() =>
          onNavigate("Workout Planner")
        }
        onOpenMessMenu={() =>
          onNavigate("Mess Menu")
        }
      />

      <section className="fvs-dashboard-hero">
        <div className="fvs-hero-content">

          <div className="fvs-hero-label">
            <span className="fvs-live-dot" />
            YOUR PERSONAL FITNESS COMMAND CENTER
          </div>

          <h2>
            THE NEXT LEVEL
            <br />
            <span>STARTS HERE.</span>
          </h2>

          <p>
            Your training. Your progress. Your pace.
            Build a balanced routine around college life
            with guided workouts and smart insights.
          </p>

          <div className="fvs-hero-buttons">
            <button
              className="fvs-primary-button"
              onClick={() =>
                onNavigate("Workout Planner")
              }
            >
              <Dumbbell size={19} />
              Enter Workout Studio
              <ArrowRight size={18} />
            </button>

            <button
              className="fvs-secondary-button"
              onClick={() =>
                onNavigate("Progress")
              }
            >
              <TrendingUp size={18} />
              View Progress
            </button>
          </div>

          <div className="fvs-hero-bottom">
            <span>
              <ShieldCheck size={16} />
              YOUR PACE
            </span>

            <span>
              <HeartPulse size={16} />
              RECOVERY MATTERS
            </span>

            <span>
              <Zap size={16} />
              SMART TRAINING
            </span>
          </div>
        </div>

        <div className="fvs-hero-art">
          <div className="fvs-hero-ring ring-one" />
          <div className="fvs-hero-ring ring-two" />
          <div className="fvs-hero-ring ring-three" />

          <div className="fvs-hero-symbol">
            <Activity size={90} strokeWidth={1.2} />
          </div>
        </div>
      </section>

      <div className="fvs-dashboard-section-title">
        <div>
          <span className="fvs-eyebrow">
            YOUR PERFORMANCE SNAPSHOT
          </span>
          <h3>At a Glance</h3>
        </div>
      </div>

      <section className="fvs-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className={
                index === 0
                  ? "fvs-stat-card fvs-stat-accent"
                  : "fvs-stat-card"
              }
            >
              <div className="fvs-stat-top">
                <span>{stat.label}</span>

                <div className="fvs-stat-icon">
                  <Icon size={20} />
                </div>
              </div>

              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
            </div>
          );
        })}
      </section>

      <div className="fvs-dashboard-section-title">
        <div>
          <span className="fvs-eyebrow">
            YOUR FITNESS JOURNEY
          </span>
          <h3>Keep Moving Forward</h3>
        </div>
      </div>

      <section
        style={{
          padding: 26,
          borderRadius: 18,
          border: "1px solid #38563b",
          background:
            "linear-gradient(145deg, #1d3321, #112017)",
          color: "#f5f9f1"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12
          }}
        >
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#304a2a",
              color: "#b8f548"
            }}
          >
            <Dumbbell size={24} />
          </div>

          <div>
            <h3 style={{ margin: 0 }}>
              Your Workout Studio
            </h3>

            <p
              style={{
                margin: "6px 0 0",
                color: "#b7cdb4"
              }}
            >
              Guided sessions and adaptive progression.
            </p>
          </div>
        </div>

        <p
          style={{
            marginTop: 20,
            color: "#c4d5bf",
            lineHeight: 1.8
          }}
        >
          Your workouts and progress tracker remain
          available through the navigation menu.
          Choose sessions that match your preferences
          and allow time for recovery.
        </p>

        <button
          className="fvs-primary-button"
          onClick={() =>
            onNavigate("Workout Planner")
          }
        >
          <Dumbbell size={18} />
          Start Training
          <ArrowRight size={18} />
        </button>
      </section>

    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [needsProfileSetup, setNeedsProfileSetup] =
    useState(false);

  const [authLoading, setAuthLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState("");

  const [profile, setProfile] = useState(null);

  const [trainingState, setTrainingState] =
    useState(loadTrainingState);

  const studentName = getFirstName(profile, currentUser);

  function refreshData() {
    setTrainingState(loadTrainingState());

    const cachedProfile = readJSON(
      PROFILE_KEY,
      null
    );

    if (cachedProfile) {
      setProfile(cachedProfile);
    }
  }

  useEffect(() => {
    function onProfileUpdated() {
      refreshData();
    }

    window.addEventListener(
      "fitverse-profile-updated",
      onProfileUpdated
    );

    window.addEventListener(
      "storage",
      onProfileUpdated
    );

    return () => {
      window.removeEventListener(
        "fitverse-profile-updated",
        onProfileUpdated
      );

      window.removeEventListener(
        "storage",
        onProfileUpdated
      );
    };
  }, []);

  useEffect(() => {
    function handlePageHide() {
      if (currentUser?.id) {
        saveTraining(currentUser.id);
      }
    }

    window.addEventListener(
      "pagehide",
      handlePageHide
    );

    return () => {
      window.removeEventListener(
        "pagehide",
        handlePageHide
      );
    };
  }, [currentUser]);

  async function handleLogin(user) {
    const userId = String(
      user?.id || user?._id || ""
    );

    if (!userId) {
      throw new Error(
        "The server did not return a valid user ID."
      );
    }

    setAuthLoading(true);
    setSetupMessage("");

    try {
      const response = await profileAPI.get();

      if (!response.success) {
        throw new Error(
          "Unable to load your account profile."
        );
      }

      const serverProfile = response.profile || null;

      backupLegacyData();
      clearActiveData();

      restoreTraining(userId);

      // MongoDB is authoritative when a cloud record exists.
      // A missing cloud record starts with default levels.
      // Never upload old browser data automatically.
      const cloudTraining =
        await loadAdaptiveProgressFromMongoDB();

      localStorage.setItem(
        TRAINING_KEY,
        JSON.stringify(cloudTraining)
      );

      saveTraining(userId);

      if (serverProfile) {
        localStorage.setItem(
          PROFILE_KEY,
          JSON.stringify(serverProfile)
        );
      }

      const normalizedUser = {
        ...user,
        id: userId
      };

      setCurrentUser(normalizedUser);
      setProfile(serverProfile);

      setNeedsProfileSetup(
        !serverProfile?.name ||
        !serverProfile?.department
      );

      setActivePage("Dashboard");
      setTrainingState(loadTrainingState());

      window.dispatchEvent(
        new Event("fitverse-adaptive-progress-updated")
      );

      window.dispatchEvent(
        new Event("fitverse-profile-updated")
      );
    } catch (error) {
      clearAccessToken();
      clearActiveData();

      setCurrentUser(null);
      setProfile(null);

      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    if (currentUser?.id) {
      saveTraining(currentUser.id);
    }

    clearAccessToken();
    clearActiveData();

    setCurrentUser(null);
    setProfile(null);
    setNeedsProfileSetup(false);

    setActivePage("Dashboard");
    setSidebarOpen(false);
    setSetupMessage("");

    setTrainingState(loadTrainingState());
  }

  async function continueFromSetup() {
    setSetupMessage("");

    try {
      const response = await profileAPI.get();

      const savedProfile = response.profile;

      if (
        !savedProfile?.name?.trim() ||
        !savedProfile?.department?.trim()
      ) {
        setSetupMessage(
          "Please complete and save your student profile first."
        );
        return;
      }

      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(savedProfile)
      );

      setProfile(savedProfile);
      setNeedsProfileSetup(false);
      setActivePage("Dashboard");

      window.dispatchEvent(
        new Event("fitverse-profile-updated")
      );
    } catch (error) {
      setSetupMessage(
        error.message ||
        "Unable to verify your saved profile."
      );
    }
  }

  function navigate(page) {
    if (currentUser?.id) {
      saveTraining(currentUser.id);
    }

    refreshData();

    setActivePage(page);
    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function renderPage() {
    switch (activePage) {
      case "Workout Planner":
        return <WorkoutPlanner />;

      case "Mess Menu":
        return <MessMenu />;

      case "Progress":
        return <ProgressTracker />;

      case "Profile":
        return (
          <StudentProfile key={currentUser.id} />
        );

      default:
        return (
          <Dashboard
            trainingState={trainingState}
            onNavigate={navigate}
          />
        );
    }
  }

  /*
  ========================================
  SCREEN 1 — AUTHENTICATION
  ========================================
  */

  if (!currentUser) {
    return (
      <AuthPage onLogin={handleLogin} />
    );
  }

  /*
  ========================================
  SCREEN 2 — PROFILE SETUP
  ========================================
  */

  if (needsProfileSetup) {
    return (
      <div className="fvs-app">
        <div className="fvs-main">

          <header className="fvs-topbar">
            <div className="fvs-topbar-left">
              <div className="fvs-page-heading">
                <span className="fvs-topbar-breadcrumb">
                  FITVERSE AI
                  <ChevronRight size={13} />
                  ACCOUNT SETUP
                </span>

                <h1>Welcome to FitVerse AI</h1>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="fvs-secondary-button"
            >
              <LogOut size={18} />
              Logout
            </button>
          </header>

          <main className="fvs-page-content">

            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto"
              }}
            >
              <div
                style={{
                  marginBottom: 25,
                  padding: 24,
                  borderRadius: 16,
                  border: "1px solid #38563b",
                  background: "#192d1e"
                }}
              >
                <span
                  style={{
                    color: "#b8f548",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: 1.5
                  }}
                >
                  STEP 01 / PERSONALIZE YOUR SPACE
                </span>

                <h2
                  style={{
                    margin: "12px 0",
                    fontSize: 28,
                    color: "#f5f9f1"
                  }}
                >
                  Welcome,{" "}
                  {getFirstName(null, currentUser)}!
                </h2>

                <p
                  style={{
                    color: "#b5c9b3",
                    lineHeight: 1.8
                  }}
                >
                  Complete your student profile
                  before entering the dashboard.
                  Select your hostel, mess category,
                  fitness goal and workout preferences.
                </p>
              </div>

              <StudentProfile
                key={currentUser.id}
              />

              {setupMessage && (
                <p
                  role="alert"
                  style={{
                    padding: 14,
                    marginTop: 20,
                    borderRadius: 10,
                    background: "#39211f",
                    color: "#ffbbb2"
                  }}
                >
                  {setupMessage}
                </p>
              )}

              <button
                type="button"
                onClick={continueFromSetup}
                disabled={authLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  width: "100%",
                  maxWidth: 420,
                  margin: "28px auto",
                  padding: "17px 24px",
                  border: "none",
                  borderRadius: 11,
                  background: "#b8f548",
                  color: "#14210d",
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                CONTINUE TO DASHBOARD
                <ArrowRight size={19} />
              </button>

              <p
                style={{
                  color: "#91a692",
                  textAlign: "center",
                  fontSize: 12
                }}
              >
                Save your profile first, then continue.
              </p>
            </div>

          </main>
        </div>
      </div>
    );
  }

  /*
  ========================================
  SCREEN 3 — MAIN APPLICATION
  ========================================
  */

  return (
    <div className="fvs-app">

      {sidebarOpen && (
        <button
          className="fvs-mobile-backdrop"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close navigation"
        />
      )}

      <aside
        className={
          sidebarOpen
            ? "fvs-sidebar open"
            : "fvs-sidebar"
        }
      >
        <div className="fvs-sidebar-brand">
          <div className="fvs-brand-icon">
            <HeartPulse size={26} />
          </div>

          <div className="fvs-brand-text">
            <strong>
              FITVERSE <span>AI</span>
            </strong>

            <small>
              BEYOND THE LIMITS
            </small>
          </div>

          <button
            className="fvs-sidebar-close"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="fvs-sidebar-section-label">
          MAIN NAVIGATION
        </div>

        <nav className="fvs-nav">
          {MENU_ITEMS.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={
                  activePage === item.name
                    ? "fvs-nav-item active"
                    : "fvs-nav-item"
                }
                onClick={() =>
                  navigate(item.name)
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>

                {activePage === item.name && (
                  <ChevronRight size={16} />
                )}
              </button>
            );
          })}
        </nav>

        <div className="fvs-sidebar-spacer" />

        <div className="fvs-sidebar-promo">
          <div className="fvs-promo-icon">
            <Zap size={23} />
          </div>

          <span>YOUR FITNESS SPACE</span>

          <h3>
            TRAIN SMART.
            <br />
            FEEL STRONG.
          </h3>

          <p>
            Explore training that adapts
            to your experience and feedback.
          </p>

          <button
            onClick={() =>
              navigate("Workout Planner")
            }
          >
            OPEN STUDIO
            <ArrowRight size={15} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "calc(100% - 24px)",
            margin: "15px 12px",
            padding: 13,
            border: "1px solid #46633d",
            borderRadius: 10,
            background: "#233924",
            color: "#c5ee9c",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          <LogOut size={18} />
          LOGOUT
        </button>

        <div className="fvs-sidebar-bottom">
          <div className="fvs-sidebar-status">
            <span className="fvs-live-dot" />
            FITVERSE SYSTEM ACTIVE
          </div>

          <small>
            VIT STUDENT WELLNESS PLATFORM
          </small>
        </div>
      </aside>

      <div className="fvs-main">

        <header className="fvs-topbar">

          <div className="fvs-topbar-left">
            <button
              className="fvs-mobile-menu"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div className="fvs-page-heading">
              <span className="fvs-topbar-breadcrumb">
                FITVERSE AI
                <ChevronRight size={13} />
                {activePage.toUpperCase()}
              </span>

              <h1>{activePage}</h1>
            </div>
          </div>

          <div className="fvs-topbar-right">
            <div className="fvs-topbar-date">
              <CalendarDays size={17} />

              {new Date().toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                }
              )}
            </div>

            <div className="fvs-topbar-divider" />

            <button
              className="fvs-user-button"
              onClick={() =>
                navigate("Profile")
              }
              title="Open your profile"
            >
              <div className="fvs-user-avatar">
                {studentName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>{studentName}</strong>
                <span>FitVerse Member</span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              style={{
                display: "grid",
                placeItems: "center",
                width: 39,
                height: 39,
                border: "1px solid #38543a",
                borderRadius: 10,
                background: "#213622",
                color: "#b8f548",
                cursor: "pointer"
              }}
            >
              <LogOut size={18} />
            </button>
          </div>

        </header>

        <main className="fvs-page-content">

          {activePage === "Dashboard" && (
            <div className="fvs-welcome-row">
              <div>
                <span className="fvs-eyebrow">
                  WELCOME TO FITVERSE AI
                </span>

                <h2>
                  {getGreeting()}, {studentName}
                  <span className="fvs-welcome-dot">
                    .
                  </span>
                </h2>

                <p>
                  Here's your personal wellness
                  overview for today.
                </p>
              </div>

              <div className="fvs-welcome-status">
                <Sparkles size={17} />
                YOUR JOURNEY, YOUR PACE
              </div>
            </div>
          )}

          {renderPage()}

        </main>

        <footer className="fvs-global-footer">
          <span>
            © {new Date().getFullYear()} FitVerse AI
          </span>

          <span>
            <HeartPulse size={14} />
            MOVE • RECOVER • EVOLVE
          </span>
        </footer>

      </div>
    </div>
  );
}

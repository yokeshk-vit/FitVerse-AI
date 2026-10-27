
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  HeartPulse,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import {
  loadTrainingState,
  getProgressionRecommendations,
  TRAINING_LEVELS
} from "../utils/adaptiveWorkoutEngine";

import {
  getWorkoutHistoryFromMongoDB
} from "../services/workoutPersistence";

import "./ProgressTracker.css";

const COLORS = [
  "#b8f548",
  "#79b936",
  "#4f8c52",
  "#57bdb0",
  "#e3c46d"
];

const GROUP_LABELS = {
  push: "Upper Body",
  squat: "Leg Strength",
  core: "Core",
  cardio: "Cardio",
  glutes: "Glutes"
};

function localDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function getSessionDate(session) {
  const value =
    session.completedAt ||
    session.createdAt ||
    session.date;

  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return localDateString(date);
}

function getLastSevenDays(sessions, today) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);

    date.setDate(
      today.getDate() - (6 - index)
    );

    const dateKey = localDateString(date);

    return {
      day: date.toLocaleDateString("en-US", {
        weekday: "short"
      }),
      date: dateKey,
      sessions: sessions.filter(
        session => getSessionDate(session) === dateKey
      ).length
    };
  });
}

function getActivityCalendar(sessions, today) {
  const activeDates = new Set(
    sessions.map(getSessionDate)
  );

  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date(today);

    date.setDate(
      today.getDate() - (27 - index)
    );

    const dateKey = localDateString(date);

    return {
      date: dateKey,
      day: date.getDate(),
      active: activeDates.has(dateKey),
      today: index === 27
    };
  });
}

function getCompletedExercises(session) {
  if (!Array.isArray(session.exercises)) {
    return [];
  }

  return session.exercises.filter(
    exercise => exercise.completed === true
  );
}

function getExerciseGroup(name) {
  const text = String(name || "").toLowerCase();

  if (
    /glute|hip thrust|bridge|kickback/.test(text)
  ) {
    return "glutes";
  }

  if (
    /squat|lunge|leg press|calf|step.up|wall sit/.test(text)
  ) {
    return "squat";
  }

  if (
    /plank|crunch|sit.up|dead bug|mountain climber|russian twist|abdominal|core/.test(text)
  ) {
    return "core";
  }

  if (
    /run|jog|walk|cycling|bike|jumping jack|high knee|burpee|cardio|march/.test(text)
  ) {
    return "cardio";
  }

  if (
    /push.up|pushup|press|row|curl|shoulder|tricep|bicep|chest|pull.up|upper body/.test(text)
  ) {
    return "push";
  }

  return null;
}

function getCategoryData(sessions) {
  const counts = {};

  sessions.forEach(session => {
    getCompletedExercises(session).forEach(exercise => {
      const group = getExerciseGroup(exercise.name);

      const label = group
        ? GROUP_LABELS[group]
        : "Other Exercises";

      counts[label] = (counts[label] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => b.value - a.value);
}

function getEffortLabel(session) {
  const notes = String(session.notes || "");

  const match = notes.match(
    /Effort:\s*([^;]+)/i
  );

  const effort = match
    ? match[1].trim().toLowerCase()
    : "";

  if (effort === "easy") return "Comfortable";
  if (effort === "hard") return "Challenging";
  if (effort === "manageable") return "Manageable";

  return "Completed";
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accent = false
}) {
  return (
    <div
      className={`fva-stat-card ${
        accent ? "fva-stat-accent" : ""
      }`}
    >
      <div className="fva-stat-top">
        <span>{label}</span>

        <div className="fva-stat-icon">
          <Icon size={20} />
        </div>
      </div>

      <strong>{value}</strong>
      <p>{description}</p>

      <div className="fva-stat-bottom">
        <span />
        <ArrowUpRight size={16} />
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon
}) {
  return (
    <div className="fva-card-heading">
      <div>
        <span className="fva-eyebrow">
          {eyebrow}
        </span>

        <h3>{title}</h3>

        {description && <p>{description}</p>}
      </div>

      {Icon && (
        <div className="fva-heading-icon">
          <Icon size={21} />
        </div>
      )}
    </div>
  );
}

export default function ProgressTracker() {
  const [trainingState, setTrainingState] =
    useState(loadTrainingState);

  const [sessions, setSessions] = useState([]);

  const [today, setToday] = useState(
    () => new Date()
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshMessage, setRefreshMessage] =
    useState("");

  const [refreshCount, setRefreshCount] =
    useState(0);

  const refreshData = useCallback(
    async (showMessage = false) => {
      setLoading(true);
      setError("");
      setRefreshMessage("");

      setTrainingState(loadTrainingState());
      setToday(new Date());

      try {
        const workouts =
          await getWorkoutHistoryFromMongoDB();

        setSessions(workouts);

        if (showMessage) {
          setRefreshMessage(
            `Progress updated! Loaded ${workouts.length} saved workout sessions from MongoDB Atlas.`
          );
        }
      } catch (err) {
        setError(
          err.message ||
          "Unable to load workout history from MongoDB Atlas."
        );
      } finally {
        setLoading(false);
        setRefreshCount(previous => previous + 1);
      }
    },
    []
  );

  useEffect(() => {
    refreshData(false);
  }, [refreshData]);

  useEffect(() => {
    function handleFocus() {
      refreshData(false);
    }

    function handleStorage(event) {
      if (
        event.key ===
        "fitverse-adaptive-training-v1"
      ) {
        setTrainingState(loadTrainingState());
      }
    }

    window.addEventListener("focus", handleFocus);

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [refreshData]);

  const recommendations = useMemo(
    () => getProgressionRecommendations(trainingState),
    [trainingState]
  );

  const weeklyData = useMemo(
    () => getLastSevenDays(sessions, today),
    [sessions, today]
  );

  const activityCalendar = useMemo(
    () => getActivityCalendar(sessions, today),
    [sessions, today]
  );

  const categoryData = useMemo(
    () => getCategoryData(sessions),
    [sessions]
  );

  const weeklySessions = weeklyData.reduce(
    (total, item) => total + item.sessions,
    0
  );

  const activeInCalendar = activityCalendar.filter(
    day => day.active
  ).length;

  const activeDays = new Set(
    sessions.map(getSessionDate).filter(Boolean)
  ).size;

  const totalMinutes = sessions.reduce(
    (total, session) =>
      total + (Number(session.durationMinutes) || 0),
    0
  );

  const lastSession = [...sessions].sort(
    (a, b) =>
      new Date(
        b.completedAt || b.createdAt || 0
      ).getTime() -
      new Date(
        a.completedAt || a.createdAt || 0
      ).getTime()
  )[0];

  const focusTotal = categoryData.reduce(
    (total, item) => total + item.value,
    0
  );

  const formattedToday = today.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric"
    }
  );

  return (
    <main className="fva-page">

      {/* HERO */}
      <section className="fva-hero">
        <div className="fva-hero-content">
          <span className="fva-kicker">
            <span className="fva-live-dot" />
            FITVERSE PERFORMANCE INTELLIGENCE
          </span>

          <h1>
            TRACK YOUR
            <br />
            <span>PROGRESS.</span>
          </h1>

          <p>
            Every session tells part of your story.
            Explore your training history, movement
            preferences, and personal progress in
            one beautifully organized space.
          </p>

          <div className="fva-hero-tags">
            <span>
              <Activity size={15} />
              TRAINING ANALYTICS
            </span>

            <span>
              <CalendarDays size={15} />
              28-DAY OVERVIEW
            </span>
          </div>
        </div>

        <div className="fva-hero-side">
          <div className="fva-hero-orbit">
            <div className="fva-hero-orbit-inner">
              <TrendingUp size={52} />
            </div>
          </div>

          <span>MOVE • LEARN • GROW</span>
        </div>
      </section>

      {/* PAGE HEADING */}
      <div className="fva-overview-heading">
        <div>
          <span className="fva-eyebrow">
            YOUR PERSONAL OVERVIEW
          </span>

          <h2>Performance Dashboard</h2>

          <p>Updated for {formattedToday}</p>
        </div>

        <button
          type="button"
          className="fva-refresh-button"
          onClick={() => refreshData(true)}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Loading..." : "Refresh Data"}
        </button>
      </div>

      {/* DATABASE STATUS */}
      {loading && (
        <div
          className="fva-refresh-message"
          role="status"
        >
          <RefreshCw size={18} />
          Loading your workout history from MongoDB Atlas...
        </div>
      )}

      {error && (
        <div
          className="fva-refresh-message"
          role="alert"
          style={{
            borderColor: "#a65b5b",
            color: "#ffb5b5"
          }}
        >
          <Activity size={18} />
          {error}
        </div>
      )}

      {refreshMessage && !loading && (
        <div
          className="fva-refresh-message"
          role="status"
          key={refreshCount}
        >
          <CheckCircle2 size={18} />
          {refreshMessage}
        </div>
      )}

      {/* STATISTICS */}
      <section className="fva-stat-grid">
        <StatCard
          icon={Dumbbell}
          label="TOTAL SESSIONS"
          value={sessions.length}
          description="Workouts saved in MongoDB Atlas"
          accent
        />

        <StatCard
          icon={CalendarDays}
          label="ACTIVE DAYS"
          value={activeDays}
          description="Different recorded training dates"
        />

        <StatCard
          icon={Activity}
          label="LAST 7 DAYS"
          value={weeklySessions}
          description="Recent completed sessions"
        />

        <StatCard
          icon={Clock3}
          label="TRAINING MINUTES"
          value={totalMinutes}
          description="Total recorded workout duration"
        />
      </section>

      {/* MAIN CHARTS */}
      <section className="fva-main-grid">
        <article className="fva-card">
          <SectionHeading
            eyebrow="ACTIVITY INSIGHTS"
            title="Weekly Training Activity"
            description="Your MongoDB workout sessions over the last seven days"
            icon={TrendingUp}
          />

          <div className="fva-chart-wrap">
            <ResponsiveContainer
              width="100%"
              height={275}
            >
              <BarChart
                data={weeklyData}
                margin={{
                  top: 15,
                  right: 8,
                  left: -20,
                  bottom: 0
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#293b2c"
                  strokeDasharray="4 5"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#8fa294",
                    fontSize: 12
                  }}
                  dy={10}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#8fa294",
                    fontSize: 11
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(184,245,72,0.06)"
                  }}
                  contentStyle={{
                    background: "#1c2b20",
                    border: "1px solid #3c523e",
                    borderRadius: 12,
                    color: "#f4f8ef"
                  }}
                  labelStyle={{
                    color: "#f4f8ef"
                  }}
                />

                <Bar
                  dataKey="sessions"
                  name="Sessions"
                  fill="#b8f548"
                  radius={[7, 7, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="fva-chart-footer">
            <span>
              <span className="fva-color-dot" />
              MongoDB workout sessions
            </span>

            <strong>
              {weeklySessions} in the last 7 days
            </strong>
          </div>
        </article>

        <article className="fva-card">
          <SectionHeading
            eyebrow="MOVEMENT BREAKDOWN"
            title="Workout Focus Areas"
            description="Completed exercises grouped by movement type"
            icon={Zap}
          />

          {categoryData.length > 0 ? (
            <>
              <div className="fva-donut-wrap">
                <ResponsiveContainer
                  width="100%"
                  height={245}
                >
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={101}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {categoryData.map(
                        (item, index) => (
                          <Cell
                            key={item.name}
                            fill={
                              COLORS[
                                index % COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background: "#1c2b20",
                        border: "1px solid #3c523e",
                        borderRadius: 12,
                        color: "#f4f8ef"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="fva-donut-center">
                  <strong>{focusTotal}</strong>
                  <span>EXERCISES</span>
                </div>
              </div>

              <div className="fva-focus-list">
                {categoryData.map((item, index) => (
                  <div
                    className="fva-focus-item"
                    key={item.name}
                  >
                    <span
                      className="fva-focus-dot"
                      style={{
                        background:
                          COLORS[
                            index % COLORS.length
                          ]
                      }}
                    />

                    <span>{item.name}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="fva-empty-state">
              <Dumbbell size={34} />
              <strong>No focus data yet</strong>

              <p>
                Your exercise breakdown will appear
                after you save a completed workout.
              </p>
            </div>
          )}
        </article>
      </section>

      {/* CALENDAR AND LEVELS */}
      <section className="fva-secondary-grid">
        <article className="fva-card">
          <SectionHeading
            eyebrow="CONSISTENCY OVERVIEW"
            title="Your Activity Calendar"
            description="The last 28 days of MongoDB workout records"
            icon={CalendarDays}
          />

          <div className="fva-calendar-summary">
            <div>
              <strong>{activeInCalendar}</strong>
              <span>ACTIVE DAYS</span>
            </div>

            <div>
              <strong>28</strong>
              <span>DAYS SHOWN</span>
            </div>
          </div>

          <div className="fva-heatmap">
            {activityCalendar.map(day => (
              <div
                key={day.date}
                className={[
                  "fva-heatmap-day",
                  day.active ? "active" : "",
                  day.today ? "today" : ""
                ].join(" ")}
                title={`${day.date}: ${
                  day.active
                    ? "Workout recorded"
                    : "No workout recorded"
                }`}
                aria-label={`${day.date}: ${
                  day.active
                    ? "Workout recorded"
                    : "No workout recorded"
                }`}
              >
                {day.day}
              </div>
            ))}
          </div>

          <div className="fva-heatmap-legend">
            <span>
              <i className="fva-legend-empty" />
              No record
            </span>

            <span>
              <i className="fva-legend-active" />
              Session recorded
            </span>
          </div>

          <div className="fva-gentle-note">
            <HeartPulse size={18} />

            <p>
              Rest and recovery are important parts
              of a healthy routine. Empty days are
              not failures.
            </p>
          </div>
        </article>

        <article className="fva-card">
          <SectionHeading
            eyebrow="ADAPTIVE TRAINING"
            title="Your Training Levels"
            description="Current exercise variations from your adaptive training engine"
            icon={Trophy}
          />

          <div className="fva-level-list">
            {Object.entries(
              trainingState.levels || {}
            ).map(([group, level]) => {
              const safeLevel = Math.max(
                1,
                Math.min(4, Number(level) || 1)
              );

              return (
                <div
                  className="fva-level-item"
                  key={group}
                >
                  <div className="fva-level-heading">
                    <div>
                      <strong>
                        {GROUP_LABELS[group] || group}
                      </strong>

                      <span>
                        {TRAINING_LEVELS[
                          safeLevel - 1
                        ]?.name || "Foundation"}
                      </span>
                    </div>

                    <span className="fva-level-badge">
                      LVL {safeLevel}
                    </span>
                  </div>

                  <div className="fva-level-track">
                    <div
                      style={{
                        width: `${
                          (safeLevel / 4) * 100
                        }%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fva-level-note">
            <Sparkles size={17} />
            Levels reflect locally saved training
            feedback. Advancing is always optional.
          </div>

          <div
            className="fva-level-note"
            style={{ marginTop: 12 }}
          >
            <Trophy size={17} />
            {recommendations.length} optional
            exercise variation upgrades available.
          </div>
        </article>
      </section>

      {/* WORKOUT HISTORY */}
      <section className="fva-card fva-history-card">
        <SectionHeading
          eyebrow="YOUR TRAINING JOURNAL"
          title="Recent Workout Sessions"
          description="Your latest workouts retrieved from MongoDB Atlas"
          icon={Clock3}
        />

        {sessions.length === 0 ? (
          <div className="fva-empty-state">
            <Activity size={34} />

            <strong>
              {loading
                ? "Loading workout history..."
                : error
                ? "Workout history unavailable"
                : "Your journal starts here"}
            </strong>

            <p>
              {error
                ? "Please check your backend connection and refresh."
                : "Complete and save a session in Workout Planner to see it here."}
            </p>
          </div>
        ) : (
          <div className="fva-history-list">
            {[...sessions]
              .sort(
                (a, b) =>
                  new Date(
                    b.completedAt || b.createdAt || 0
                  ).getTime() -
                  new Date(
                    a.completedAt || a.createdAt || 0
                  ).getTime()
              )
              .slice(0, 8)
              .map((session, index) => (
                <div
                  className="fva-history-row"
                  key={
                    session._id ||
                    session.id ||
                    index
                  }
                >
                  <div className="fva-history-icon">
                    <CheckCircle2 size={20} />
                  </div>

                  <div className="fva-history-details">
                    <strong>
                      {session.workoutName ||
                        "Workout Session"}
                    </strong>

                    <p>
                      {getSessionDate(session)}
                      {" • "}
                      {session.durationMinutes || 0}
                      {" min • "}
                      {getCompletedExercises(session).length}
                      {" exercises"}
                    </p>
                  </div>

                  <span className="fva-effort-tag">
                    {getEffortLabel(session)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <div className="fva-footer-note">
        <HeartPulse size={18} />

        <p>
          Workout history and activity statistics
          are loaded from MongoDB Atlas.
          Training levels currently use locally
          saved adaptive feedback.
          These insights are not a medical assessment
          or a measurement of physical fitness.

          {lastSession && (
            <>
              {" "}Latest recorded session:{" "}
              {getSessionDate(lastSession)}.
            </>
          )}
        </p>
      </div>

    </main>
  );
}

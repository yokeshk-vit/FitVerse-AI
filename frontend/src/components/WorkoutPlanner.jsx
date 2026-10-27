
import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Dumbbell,
  HeartPulse,
  Info,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Zap
} from "lucide-react";

import {
  generateSmartWorkout,
  getWorkoutPreferences,
  SESSION_DURATIONS
} from "../utils/smartWorkoutGenerator";

import {
  loadTrainingState,
  getTrainingSummary,
  getProgressionRecommendations,
  recordWorkoutSession,
  acceptLevelUpgrade,
  TRAINING_LEVELS
} from "../utils/adaptiveWorkoutEngine";

import { saveWorkoutToMongoDB } from "../services/workoutPersistence";

import "./WorkoutStudio.css";

const DAYS = [
  "Mon", "Tue", "Wed", "Thu",
  "Fri", "Sat", "Sun"
];

const GROUP_NAMES = {
  push: "Upper Body",
  squat: "Leg Strength",
  core: "Core",
  cardio: "Cardio",
  glutes: "Glutes"
};

const GOAL_DESCRIPTIONS = {
  general:
    "A balanced approach combining strength, cardio, mobility and recovery.",
  strength:
    "Your training prioritizes controlled strength and stability movements.",
  endurance:
    "Your training prioritizes comfortable cardio and endurance activities.",
  flexibility:
    "Your training prioritizes mobility and movement quality."
};

function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

function getWeekDate(index, today) {
  const date = new Date(today);

  date.setDate(
    date.getDate() + index - mondayIndex(today)
  );

  return date;
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remaining
  ).padStart(2, "0")}`;
}

function getPhaseName(phase) {
  if (phase === "warmup") return "WARM-UP";
  if (phase === "main") return "MAIN WORKOUT";
  if (phase === "cooldown") return "COOL-DOWN";
  return "RECOVERY";
}

function phaseColor(phase) {
  if (phase === "warmup") return "warmup";
  if (phase === "cooldown") return "cooldown";
  if (phase === "recovery") return "recovery";
  return "main";
}

const personalizedCardStyle = {
  marginTop: 20,
  padding: "22px",
  border: "1px solid #3a5938",
  borderRadius: 16,
  background:
    "linear-gradient(135deg, #203923, #142619)",
  color: "#f4f9ef"
};

const personalizedTagStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "8px 12px",
  borderRadius: 9,
  background: "#304c2b",
  color: "#c5f78a",
  fontSize: 12,
  fontWeight: 700
};

export default function WorkoutPlanner() {
  const [today, setToday] = useState(
    () => new Date()
  );

  const [preferences, setPreferences] = useState(
    getWorkoutPreferences
  );

  const [duration, setDuration] = useState(
    () => getWorkoutPreferences().workoutDuration
  );

  const [trainingState, setTrainingState] = useState(
    loadTrainingState
  );

  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isResting, setIsResting] = useState(false);

  const [completedStepIds, setCompletedStepIds] =
    useState([]);

  const [sessionFinished, setSessionFinished] =
    useState(false);

  const [sessionSaved, setSessionSaved] =
    useState(false);

  const [isSavingSession, setIsSavingSession] =
    useState(false);

  const [effort, setEffort] = useState("manageable");
  const [technique, setTechnique] =
    useState("confident");
  const [recovery, setRecovery] = useState("good");
  const [message, setMessage] = useState("");

  const selectedDay = mondayIndex(today);

  const workout = useMemo(
    () =>
      generateSmartWorkout({
        date: today,
        duration,
        trainingState,
        fitnessGoal: preferences.fitnessGoal
      }),
    [
      today,
      duration,
      trainingState,
      preferences.fitnessGoal
    ]
  );

  const summary = getTrainingSummary(trainingState);

  const recommendations =
    getProgressionRecommendations(trainingState);

  const exercises = workout.exercises || [];
  const currentExercise = exercises[activeStep];

  const completedCount = completedStepIds.length;

  const completionPercent = exercises.length
    ? Math.round(
        (completedCount / exercises.length) * 100
      )
    : 0;

  const isRecovery = workout.type === "recovery";

  const currentStepProgress =
    currentExercise && currentExercise.duration > 0
      ? Math.round(
          ((currentExercise.duration - remaining) /
            currentExercise.duration) *
            100
        )
      : 0;

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = new Date();

      setToday(previous =>
        previous.toDateString() === now.toDateString()
          ? previous
          : now
      );
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function refreshData() {
      if (playerOpen) return;

      const updatedPreferences =
        getWorkoutPreferences();

      setPreferences(updatedPreferences);
      setDuration(previous =>
        previous === updatedPreferences.workoutDuration
          ? previous
          : updatedPreferences.workoutDuration
      );

      setTrainingState(loadTrainingState());
    }

    window.addEventListener("focus", refreshData);
    window.addEventListener(
      "fitverse-profile-updated",
      refreshData
    );
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("focus", refreshData);
      window.removeEventListener(
        "fitverse-profile-updated",
        refreshData
      );
      window.removeEventListener(
        "storage",
        refreshData
      );
    };
  }, [playerOpen]);

  useEffect(() => {
    if (
      !playerOpen ||
      !isPlaying ||
      sessionFinished ||
      !currentExercise ||
      remaining <= 0
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRemaining(value => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [
    playerOpen,
    isPlaying,
    sessionFinished,
    currentExercise,
    remaining
  ]);

  useEffect(() => {
    if (
      !playerOpen ||
      !isPlaying ||
      !currentExercise ||
      remaining !== 0 ||
      sessionFinished
    ) {
      return;
    }

    if (!isResting) {
      setCompletedStepIds(previous =>
        previous.includes(currentExercise.id)
          ? previous
          : [...previous, currentExercise.id]
      );

      if (currentExercise.rest > 0) {
        setIsResting(true);
        setRemaining(currentExercise.rest);
        return;
      }
    }

    if (activeStep < exercises.length - 1) {
      const nextIndex = activeStep + 1;

      setActiveStep(nextIndex);
      setRemaining(exercises[nextIndex].duration);
      setIsResting(false);
    } else {
      setSessionFinished(true);
      setIsPlaying(false);
      setIsResting(false);
    }
  }, [
    remaining,
    isPlaying,
    isResting,
    playerOpen,
    activeStep,
    currentExercise,
    exercises,
    sessionFinished
  ]);

  function resetSession() {
    setPlayerOpen(false);
    setActiveStep(0);
    setRemaining(0);
    setIsPlaying(false);
    setIsResting(false);
    setCompletedStepIds([]);
    setSessionFinished(false);
    setSessionSaved(false);
    setMessage("");
  }

  function changeDuration(value) {
    resetSession();
    setDuration(value);
  }

  function startWorkout() {
    if (exercises.length === 0) return;

    setActiveStep(0);
    setRemaining(exercises[0].duration);
    setIsResting(false);
    setCompletedStepIds([]);
    setSessionFinished(false);
    setSessionSaved(false);
    setMessage("");
    setEffort("manageable");
    setTechnique("confident");
    setRecovery("good");
    setPlayerOpen(true);
    setIsPlaying(true);
  }

  function nextExercise(markCompleted = true) {
    if (!currentExercise) return;

    if (markCompleted && !isResting) {
      setCompletedStepIds(previous =>
        previous.includes(currentExercise.id)
          ? previous
          : [...previous, currentExercise.id]
      );
    }

    if (activeStep >= exercises.length - 1) {
      setSessionFinished(true);
      setIsPlaying(false);
      setIsResting(false);
      return;
    }

    const nextIndex = activeStep + 1;

    setActiveStep(nextIndex);
    setRemaining(exercises[nextIndex].duration);
    setIsResting(false);
  }

  function previousExercise() {
    if (activeStep === 0) return;

    const previousIndex = activeStep - 1;

    setActiveStep(previousIndex);
    setRemaining(exercises[previousIndex].duration);
    setIsResting(false);
    setSessionFinished(false);
  }

  function finishEarly() {
    setSessionFinished(true);
    setIsPlaying(false);
    setIsResting(false);
  }

  async function saveSession() {
    if (sessionSaved || isSavingSession) return;

    const completedGroups = [
      ...new Set(
        exercises
          .filter(step =>
            completedStepIds.includes(step.id)
          )
          .map(step => step.group)
          .filter(Boolean)
      )
    ];

    if (completedGroups.length === 0) {
      setMessage(
        "Complete at least one tracked exercise before saving adaptive progress."
      );
      return;
    }

    setIsSavingSession(true);
    setMessage("Saving workout to MongoDB Atlas...");

    try {
      await saveWorkoutToMongoDB({
        workout,
        exercises,
        completedStepIds,
        duration,
        workoutLevel: preferences.workoutLevel,
        effort,
        technique,
        recovery
      });

      setSessionSaved(true);

      const result = recordWorkoutSession({
        effort,
        technique,
        recovery,
        completedGroups,
        date: new Date()
      });

      if (result.success) {
        setTrainingState(result.state);
        setMessage(
          "Workout saved to MongoDB Atlas and adaptive progress updated!"
        );
      } else {
        setMessage(
          "Workout saved to MongoDB, but local adaptive progress could not be updated."
        );
      }
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to save workout. Please try again."
      );
    } finally {
      setIsSavingSession(false);
    }
  }

  function handleUpgrade(group) {
    const result = acceptLevelUpgrade(group);

    setMessage(result.message);

    if (result.success) {
      setTrainingState(result.state);
    }
  }

  return (
    <div className="fv2-studio">

      {/* HERO */}

      <section className="fv2-hero">
        <div className="fv2-hero-copy">
          <div className="fv2-kicker">
            <span className="fv2-pulse-dot" />
            FITVERSE PERSONALIZED TRAINING
          </div>

          <h2>
            OWN YOUR
            <br />
            <span>MOVEMENT.</span>
          </h2>

          <p>
            Your personal training studio uses your
            fitness preferences, adaptive exercise
            levels and session feedback to prepare
            your daily workout. Move at your own pace.
          </p>

          <div className="fv2-hero-actions">
            <button
              className="fv2-btn-primary"
              onClick={startWorkout}
              disabled={exercises.length === 0}
            >
              <Play size={18} fill="currentColor" />
              {isRecovery
                ? "Start Optional Recovery"
                : "Start Today's Session"}
              <ArrowRight size={18} />
            </button>

            <span className="fv2-hero-duration">
              <Clock3 size={17} />
              {workout.estimatedMinutes} min estimated
            </span>
          </div>
        </div>

        <div className="fv2-hero-art">
          <div className="fv2-orbit fv2-orbit-one" />
          <div className="fv2-orbit fv2-orbit-two" />

          <div className="fv2-orbit-center">
            <Dumbbell size={92} strokeWidth={1.25} />
          </div>

          <span className="fv2-orbit-label">
            MOVE • RECOVER • EVOLVE
          </span>
        </div>
      </section>

      {/* PERFORMANCE METRICS */}

      <div className="fv2-metrics">
        <div className="fv2-metric">
          <div className="fv2-metric-icon">
            <Activity size={22} />
          </div>
          <span>TOTAL SESSIONS</span>
          <strong>{summary.totalSessions}</strong>
          <small>Recorded workouts</small>
        </div>

        <div className="fv2-metric">
          <div className="fv2-metric-icon">
            <CalendarDays size={22} />
          </div>
          <span>ACTIVE DAYS</span>
          <strong>{summary.activeDays}</strong>
          <small>Different training dates</small>
        </div>

        <div className="fv2-metric">
          <div className="fv2-metric-icon">
            <Target size={22} />
          </div>
          <span>TRAINING LEVEL</span>
          <strong>
            {summary.averageLevel.toFixed(1)}
          </strong>
          <small>Average exercise level</small>
        </div>

        <div className="fv2-metric">
          <div className="fv2-metric-icon">
            <Sparkles size={22} />
          </div>
          <span>NEW VARIATIONS</span>
          <strong>{recommendations.length}</strong>
          <small>Optional upgrades</small>
        </div>
      </div>

      {/* PERSONALIZED FITNESS PLAN */}

      <section
        className="fv2-panel"
        style={{ marginBottom: 20 }}
      >
        <div className="fv2-section-heading">
          <div>
            <span className="fv2-overline">
              FITVERSE SMART PERSONALIZATION
            </span>

            <h3>Your Fitness Focus</h3>

            <p>
              Automatically loaded from your
              saved Student Profile.
            </p>
          </div>

          <Sparkles size={25} />
        </div>

        <div style={personalizedCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 15
            }}
          >
            <div>
              <span
                style={{
                  color: "#b8f548",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1
                }}
              >
                YOUR SELECTED FITNESS GOAL
              </span>

              <h3
                style={{
                  margin: "10px 0",
                  color: "#fff",
                  fontSize: 23
                }}
              >
                {preferences.goalLabel}
              </h3>

              <p
                style={{
                  maxWidth: 520,
                  color: "#b9cdb5",
                  lineHeight: 1.8,
                  fontSize: 13
                }}
              >
                {GOAL_DESCRIPTIONS[
                  preferences.fitnessGoal
                ] || GOAL_DESCRIPTIONS.general}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap"
              }}
            >
              <span style={personalizedTagStyle}>
                <Target size={15} />
                {preferences.workoutLevel === "intermediate"
                  ? "Intermediate"
                  : "Beginner"}
              </span>

              <span style={personalizedTagStyle}>
                <Clock3 size={15} />
                {duration} min
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 15,
              borderTop: "1px solid #38543a",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              color: "#d0e5c8",
              fontSize: 12,
              lineHeight: 1.8
            }}
          >
            <Zap
              size={19}
              color="#b8f548"
              style={{ flexShrink: 0 }}
            />

            <span>
              {isRecovery
                ? "Today is a scheduled recovery day. Your fitness goal will not override recovery."
                : workout.recommendation ||
                  "Your workout is adapted to your selected preferences."}
              {" "}
              You can update your goal or preferred
              duration in Student Profile.
            </span>
          </div>
        </div>
      </section>

      {/* AUTOMATIC DAILY PLAN */}

      <section className="fv2-panel">
        <div className="fv2-section-heading">
          <div>
            <span className="fv2-overline">
              YOUR PERSONAL DAILY TRAINING
            </span>

            <h3>Today's Workout</h3>

            <p>
              Selected using today's date, your
              fitness goal and saved preferences.
            </p>
          </div>

          <CalendarDays size={24} />
        </div>

        <div className="fv2-week-strip">
          {DAYS.map((day, index) => {
            const date = getWeekDate(index, today);
            const isToday = selectedDay === index;

            return (
              <div
                key={day}
                className={
                  isToday
                    ? "fv2-day selected"
                    : "fv2-day"
                }
                aria-current={
                  isToday ? "date" : undefined
                }
              >
                <span>{day}</span>
                <strong>{date.getDate()}</strong>
                <i />
              </div>
            );
          })}
        </div>

        <div className="fv2-plan-banner">
          <div>
            <span className="fv2-overline">
              {workout.day.toUpperCase()}
              {" • "}
              {isRecovery
                ? "OPTIONAL RECOVERY"
                : "PERSONALIZED TRAINING"}
            </span>

            <h3>{workout.title}</h3>
            <p>{workout.focus}</p>
          </div>

          <div className="fv2-plan-summary">
            <span>
              <Timer size={16} />
              ~{workout.estimatedMinutes} min
            </span>

            <span>
              <Dumbbell size={16} />
              {workout.totalExercises} steps
            </span>
          </div>
        </div>

        {!isRecovery && (
          <div className="fv2-duration-picker">
            <div>
              <strong>Session Length</strong>

              <p>
                Your saved preference is{" "}
                {preferences.workoutDuration} minutes.
                You can change it for this session.
                Actual time may vary.
              </p>
            </div>

            <div className="fv2-duration-options">
              {SESSION_DURATIONS.map(value => (
                <button
                  key={value}
                  className={
                    duration === value ? "active" : ""
                  }
                  onClick={() =>
                    changeDuration(value)
                  }
                >
                  {value} min
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* WORKOUT BLUEPRINT */}

      <section className="fv2-panel">
        <div className="fv2-section-heading">
          <div>
            <span className="fv2-overline">
              THE SESSION BREAKDOWN
            </span>

            <h3>
              {isRecovery
                ? "Recovery & Mobility"
                : "Your Workout Blueprint"}
            </h3>

            <p>
              Guided exercises with timers,
              instructions and easier alternatives.
            </p>
          </div>

          <button
            className="fv2-small-start"
            onClick={startWorkout}
            disabled={exercises.length === 0}
          >
            <Play size={15} />
            Open Player
          </button>
        </div>

        <div className="fv2-phases">
          {workout.phases
            .filter(
              phase => phase.exercises.length > 0
            )
            .map((phase, phaseIndex) => (
              <div
                className="fv2-phase"
                key={phase.name}
              >
                <div className="fv2-phase-heading">
                  <div className="fv2-phase-index">
                    {String(
                      phaseIndex + 1
                    ).padStart(2, "0")}
                  </div>

                  <div>
                    <h4>{phase.name}</h4>

                    <p>
                      {phase.exercises.length} exercise
                      steps
                    </p>
                  </div>

                  <div className="fv2-phase-line" />
                </div>

                <div className="fv2-exercise-grid">
                  {phase.exercises.map(exercise => (
                    <div
                      className="fv2-exercise-card"
                      key={exercise.id}
                    >
                      <div className="fv2-exercise-top">
                        <span
                          className={`fv2-phase-tag ${phaseColor(
                            exercise.phase
                          )}`}
                        >
                          {getPhaseName(exercise.phase)}
                        </span>

                        <span className="fv2-exercise-level">
                          LVL {exercise.approvedLevel}
                        </span>
                      </div>

                      <div className="fv2-exercise-visual">
                        <span>{exercise.icon}</span>
                        <div className="fv2-visual-ring" />
                      </div>

                      <span className="fv2-muscle">
                        {exercise.muscle}
                      </span>

                      <h4>{exercise.name}</h4>

                      <div className="fv2-exercise-meta">
                        <span>
                          <Clock3 size={14} />
                          {exercise.duration}s
                        </span>

                        <span>
                          <RotateCcw size={14} />
                          {exercise.rest}s rest
                        </span>
                      </div>

                      <p className="fv2-exercise-instructions">
                        {exercise.instructions}
                      </p>

                      <div className="fv2-exercise-footer">
                        <span>
                          {exercise.round > 1
                            ? `Round ${exercise.round}`
                            : "Guided movement"}
                        </span>

                        <CheckCircle2 size={17} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="fv2-bottom-action">
          <div>
            <strong>Ready to begin?</strong>

            <p>
              Go at a comfortable pace.
              Pause or stop whenever needed.
            </p>
          </div>

          <button
            className="fv2-btn-primary"
            onClick={startWorkout}
            disabled={exercises.length === 0}
          >
            <Play size={18} fill="currentColor" />
            Launch Workout Player
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ADAPTIVE PROGRESSION */}

      <section className="fv2-panel">
        <div className="fv2-section-heading">
          <div>
            <span className="fv2-overline">
              INTELLIGENT PROGRESSION
            </span>

            <h3>Your Evolution</h3>

            <p>
              Different movement categories can
              progress independently based on
              your workout feedback.
            </p>
          </div>

          <Trophy size={25} />
        </div>

        <div className="fv2-level-grid">
          {Object.entries(trainingState.levels).map(
            ([group, level]) => (
              <div
                className="fv2-level-card"
                key={group}
              >
                <div className="fv2-level-card-top">
                  <span>
                    {GROUP_NAMES[group] || group}
                  </span>

                  <Zap size={17} />
                </div>

                <strong>
                  LEVEL{" "}
                  {String(level).padStart(2, "0")}
                </strong>

                <p>
                  {TRAINING_LEVELS[level - 1]?.name}
                </p>

                <div className="fv2-level-bar">
                  <div
                    style={{
                      width: `${(level / 4) * 100}%`
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>

        {recommendations.length > 0 ? (
          <div className="fv2-recommendations">
            <h4>
              <Sparkles size={20} />
              Progression Suggestions
            </h4>

            {recommendations.map(item => (
              <div
                className="fv2-recommendation"
                key={item.group}
              >
                <div>
                  <span>
                    {GROUP_NAMES[item.group] ||
                      item.group}
                  </span>

                  <h4>
                    {item.currentExercise.name}
                    {" → "}
                    {item.nextExercise.name}
                  </h4>

                  <p>{item.reason}</p>
                </div>

                <button
                  onClick={() =>
                    handleUpgrade(item.group)
                  }
                >
                  Accept Upgrade
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="fv2-progress-note">
            <Sparkles size={21} />

            <p>
              FitVerse may suggest new variations
              after several sessions with suitable
              feedback. Upgrades are optional.
            </p>
          </div>
        )}
      </section>

      <div className="fv2-safety">
        <HeartPulse size={20} />

        <p>
          Training is flexible. Take rest days,
          choose easier variations and stop if
          a movement causes discomfort.
          Your workout level is based on saved
          feedback, not a medical assessment.
        </p>
      </div>

      {message && !playerOpen && (
        <div
          className="fv2-message"
          role="status"
        >
          <Info size={17} />
          {message}
        </div>
      )}

      {/* GUIDED WORKOUT PLAYER */}

      {playerOpen && currentExercise && (
        <div className="fv2-player-overlay">
          <div
            className="fv2-player"
            role="dialog"
            aria-modal="true"
            aria-label="Guided workout player"
          >
            <div className="fv2-player-header">
              <div className="fv2-player-brand">
                <Zap size={20} />
                FITVERSE LIVE STUDIO
              </div>

              <button
                className="fv2-player-close"
                onClick={resetSession}
                aria-label="Close workout"
              >
                ✕
              </button>
            </div>

            {!sessionFinished ? (
              <>
                <div className="fv2-player-progress-header">
                  <span>
                    EXERCISE {activeStep + 1} OF{" "}
                    {exercises.length}
                  </span>

                  <span>
                    {completionPercent}% completed
                  </span>
                </div>

                <div className="fv2-player-progress-track">
                  <div
                    style={{
                      width: `${completionPercent}%`
                    }}
                  />
                </div>

                <div className="fv2-player-content">
                  <div className="fv2-player-illustration">
                    <div className="fv2-player-glow" />

                    <span>
                      {currentExercise.icon}
                    </span>
                  </div>

                  <div className="fv2-player-details">
                    <span className="fv2-overline">
                      {isResting
                        ? "RECOVERY INTERVAL"
                        : getPhaseName(
                            currentExercise.phase
                          )}
                    </span>

                    <h2>
                      {isResting
                        ? "Take a Rest"
                        : currentExercise.name}
                    </h2>

                    <p className="fv2-player-description">
                      {isResting
                        ? "Breathe comfortably. Continue when you're ready."
                        : currentExercise.instructions}
                    </p>

                    <div className="fv2-timer-ring">
                      <div
                        className="fv2-timer-circle"
                        style={{
                          "--progress": `${
                            isResting
                              ? 100
                              : Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    currentStepProgress
                                  )
                                )
                          }%`
                        }}
                      >
                        <span>
                          {formatTime(remaining)}
                        </span>

                        <small>
                          {isResting
                            ? "REST"
                            : "TIME LEFT"}
                        </small>
                      </div>
                    </div>

                    <div className="fv2-player-controls">
                      <button
                        onClick={previousExercise}
                        disabled={activeStep === 0}
                        title="Previous exercise"
                      >
                        <ChevronLeft size={23} />
                      </button>

                      <button
                        className="fv2-play-pause"
                        onClick={() =>
                          setIsPlaying(
                            previous => !previous
                          )
                        }
                      >
                        {isPlaying ? (
                          <Pause
                            size={23}
                            fill="currentColor"
                          />
                        ) : (
                          <Play
                            size={23}
                            fill="currentColor"
                          />
                        )}

                        {isPlaying
                          ? "Pause"
                          : "Resume"}
                      </button>

                      <button
                        onClick={() =>
                          nextExercise(false)
                        }
                        title="Skip exercise"
                      >
                        <SkipForward size={23} />
                      </button>
                    </div>

                    <button
                      className="fv2-mark-complete"
                      onClick={() =>
                        nextExercise(true)
                      }
                    >
                      <CheckCircle2 size={18} />
                      Mark Exercise Complete
                    </button>

                    <div className="fv2-player-tip">
                      <Info size={18} />

                      <div>
                        <strong>
                          Easier alternative
                        </strong>

                        <p>
                          {currentExercise.alternative}
                        </p>
                      </div>
                    </div>

                    <button
                      className="fv2-finish-early"
                      onClick={finishEarly}
                    >
                      Finish Session Now
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="fv2-finished">
                <div className="fv2-finished-icon">
                  <Trophy size={42} />
                </div>

                <span className="fv2-overline">
                  SESSION SUMMARY
                </span>

                <h2>SESSION COMPLETE</h2>

                <p>
                  You completed {completedCount} of{" "}
                  {exercises.length} exercise steps.
                  Shorter sessions and recovery
                  are valid choices too.
                </p>

                {!sessionSaved && (
                  <>
                    <h3>
                      How did your session feel?
                    </h3>

                    <div className="fv2-feedback-fields">
                      <label>
                        Workout difficulty

                        <select
                          value={effort}
                          onChange={event =>
                            setEffort(
                              event.target.value
                            )
                          }
                        >
                          <option value="easy">
                            Easy
                          </option>

                          <option value="manageable">
                            Manageable
                          </option>

                          <option value="hard">
                            Difficult
                          </option>
                        </select>
                      </label>

                      <label>
                        Technique confidence

                        <select
                          value={technique}
                          onChange={event =>
                            setTechnique(
                              event.target.value
                            )
                          }
                        >
                          <option value="confident">
                            Confident
                          </option>

                          <option value="unsure">
                            Need more practice
                          </option>
                        </select>
                      </label>

                      <label>
                        Recovery

                        <select
                          value={recovery}
                          onChange={event =>
                            setRecovery(
                              event.target.value
                            )
                          }
                        >
                          <option value="good">
                            Feeling good
                          </option>

                          <option value="tired">
                            Feeling tired
                          </option>

                          <option value="discomfort">
                            Experiencing discomfort
                          </option>
                        </select>
                      </label>
                    </div>

                    <button
                      className="fv2-btn-primary"
                      onClick={saveSession}
                      disabled={isSavingSession}
                    >
                      <Check size={19} />
                      {isSavingSession
                        ? "Saving to MongoDB..."
                        : "Save Workout & Feedback"}
                    </button>
                  </>
                )}

                {sessionSaved && (
                  <div className="fv2-saved-success">
                    <CheckCircle2 size={21} />
                    Your workout has been saved!
                  </div>
                )}

                {message && (
                  <p
                    className="fv2-player-message"
                    role="status"
                  >
                    {message}
                  </p>
                )}

                <button
                  className="fv2-return-btn"
                  onClick={resetSession}
                >
                  <ArrowLeft size={17} />
                  Back to Workout Studio
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

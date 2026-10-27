
import { workoutAPI } from "./api";

/*
========================================
FITVERSE AI — WORKOUT PERSISTENCE
========================================
Connects completed workouts to MongoDB Atlas.
*/

function getDifficulty(level) {
  const value = String(level || "").toLowerCase();

  if (value === "advanced") return "Advanced";
  if (value === "intermediate") return "Intermediate";

  return "Beginner";
}

function getCompletedExercises(exercises, completedStepIds) {
  const completedIds = new Set(completedStepIds);

  return exercises.slice(0, 100).map((exercise) => ({
    name: String(exercise.name || "Exercise").slice(0, 100),
    durationSeconds: Math.max(
      0,
      Math.min(
        86400,
        Math.round(Number(exercise.duration) || 0)
      )
    ),
    completed: completedIds.has(exercise.id)
  }));
}

/*
========================================
SAVE WORKOUT TO MONGODB
========================================
*/

export async function saveWorkoutToMongoDB({
  workout,
  exercises,
  completedStepIds,
  duration,
  workoutLevel,
  effort,
  technique,
  recovery
}) {
  const completedIds = new Set(completedStepIds);

  const completedExercises = exercises.filter(
    (exercise) => completedIds.has(exercise.id)
  );

  if (completedExercises.length === 0) {
    throw new Error(
      "Complete at least one exercise before saving."
    );
  }

  const completedSeconds = completedExercises.reduce(
    (total, exercise) =>
      total + Math.max(0, Number(exercise.duration) || 0),
    0
  );

  const payload = {
    workoutName: String(
      workout.title || "Personalized Workout"
    ).slice(0, 120),

    workoutType: String(
      workout.type || "General Fitness"
    ).slice(0, 80),

    difficulty: getDifficulty(workoutLevel),

    durationMinutes: Math.min(
      300,
      Math.max(0, Math.round(completedSeconds / 60))
    ),

    exercises: getCompletedExercises(
      exercises,
      completedStepIds
    ),

    completedAt: new Date().toISOString(),

    notes: [
      `Planned duration: ${duration} minutes`,
      `Effort: ${effort}`,
      `Technique: ${technique}`,
      `Recovery: ${recovery}`
    ].join("; ")
  };

  const response = await workoutAPI.save(payload);

  if (!response.success || !response.workout) {
    throw new Error(
      response.message || "Unable to save workout."
    );
  }

  return response.workout;
}

/*
========================================
GET STUDENT WORKOUT HISTORY
========================================
*/

export async function getWorkoutHistoryFromMongoDB() {
  const response = await workoutAPI.getAll();

  if (!response.success) {
    throw new Error(
      response.message || "Unable to load workout history."
    );
  }

  return Array.isArray(response.workouts)
    ? response.workouts
    : [];
}

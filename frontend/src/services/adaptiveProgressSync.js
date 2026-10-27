
/*
========================================
FITVERSE AI — ADAPTIVE PROGRESS SYNC
========================================
*/

import {
  adaptiveProgressAPI
} from "./api";

const GROUPS = [
  "push",
  "squat",
  "core",
  "cardio",
  "glutes"
];

function defaultLevels() {
  return {
    push: 1,
    squat: 1,
    core: 1,
    cardio: 1,
    glutes: 1
  };
}

function normalizeLevels(levels) {
  const normalized = defaultLevels();

  for (const group of GROUPS) {
    const level = levels?.[group];

    if (
      Number.isInteger(level) &&
      level >= 1 &&
      level <= 4
    ) {
      normalized[group] = level;
    }
  }

  return normalized;
}

function normalizeSessions(sessions) {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions
    .filter(session =>
      session &&
      typeof session.id === "string" &&
      typeof session.date === "string" &&
      Array.isArray(session.completedGroups)
    )
    .slice(-200)
    .map(session => ({
      id: session.id,
      date: session.date,
      effort: session.effort,
      technique: session.technique,
      recovery: session.recovery,
      completedGroups: session.completedGroups.filter(
        group => GROUPS.includes(group)
      ),
      levelsAtCompletion: normalizeLevels(
        session.levelsAtCompletion
      )
    }));
}

/*
========================================
LOAD PROGRESS FROM MONGODB
========================================
*/

export async function loadAdaptiveProgressFromMongoDB() {
  const response = await adaptiveProgressAPI.get();

  if (!response.success || !response.progress) {
    throw new Error(
      response.message ||
      "Unable to load adaptive training progress."
    );
  }

  return {
    levels: normalizeLevels(
      response.progress.levels
    ),
    sessions: normalizeSessions(
      response.progress.sessions
    ),
    lastUpdated:
      response.progress.lastUpdated || null
  };
}

/*
========================================
SAVE PROGRESS TO MONGODB
========================================
*/

export async function saveAdaptiveProgressToMongoDB(
  state
) {
  const payload = {
    levels: normalizeLevels(state.levels),
    sessions: normalizeSessions(state.sessions)
  };

  const response = await adaptiveProgressAPI.save(
    payload
  );

  if (!response.success || !response.progress) {
    throw new Error(
      response.message ||
      "Unable to save adaptive training progress."
    );
  }

  return {
    levels: normalizeLevels(
      response.progress.levels
    ),
    sessions: normalizeSessions(
      response.progress.sessions
    ),
    lastUpdated:
      response.progress.lastUpdated || null
  };
}

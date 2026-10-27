
const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "components",
  "WorkoutPlanner.jsx"
);

const backup = path.join(
  __dirname,
  "src",
  "components",
  "WorkoutPlanner.before-mongodb.jsx.bak"
);

try {
  let code = fs.readFileSync(file, "utf8");

  // Normalize Windows line endings.
  code = code.replace(/\r\n/g, "\n");

  if (code.includes("saveWorkoutToMongoDB")) {
    console.log("MongoDB integration already exists.");
    process.exit(0);
  }

  function replaceOnce(oldText, newText) {
    if (!code.includes(oldText)) {
      throw new Error(
        "Cannot find expected code: " +
          oldText.slice(0, 70)
      );
    }

    code = code.replace(oldText, newText);
  }

  // 1. Import MongoDB workout service.
  replaceOnce(
    'import "./WorkoutStudio.css";',
    `import { saveWorkoutToMongoDB } from "../services/workoutPersistence";

import "./WorkoutStudio.css";`
  );

  // 2. Add loading state.
  replaceOnce(
    `  const [sessionSaved, setSessionSaved] =
    useState(false);`,
    `  const [sessionSaved, setSessionSaved] =
    useState(false);

  const [isSavingSession, setIsSavingSession] =
    useState(false);`
  );

  // 3. Replace the existing save function.
  const startMarker = "  function saveSession() {";
  const endMarker = "\n  function handleUpgrade(group) {";

  const start = code.indexOf(startMarker);
  const end = code.indexOf(endMarker, start);

  if (start < 0 || end < 0) {
    throw new Error(
      "Cannot locate the original saveSession function."
    );
  }

  const newSaveSession = `  async function saveSession() {
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
`;

  code =
    code.slice(0, start) +
    newSaveSession +
    code.slice(end);

  // 4. Disable button during saving.
  replaceOnce(
    `                      onClick={saveSession}
                    >`,
    `                      onClick={saveSession}
                      disabled={isSavingSession}
                    >`
  );

  // 5. Display saving status.
  replaceOnce(
    "                      Save Workout & Feedback",
    `                      {isSavingSession
                        ? "Saving to MongoDB..."
                        : "Save Workout & Feedback"}`
  );

  // 6. Create backup before modifying original.
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(file, backup);
  }

  // 7. Write updated Workout Planner.
  fs.writeFileSync(file, code, "utf8");

  console.log("");
  console.log("SUCCESS: WorkoutPlanner.jsx updated.");
  console.log("Backup:", backup);
  console.log("Premium workout interface preserved.");
  console.log("MongoDB saving integration added.");
  console.log("");

} catch (error) {
  console.error("");
  console.error("UPDATE FAILED:", error.message);
  console.error("Original WorkoutPlanner.jsx was not modified.");
  process.exitCode = 1;
}

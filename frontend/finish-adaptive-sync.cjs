
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "src", "components", "WorkoutPlanner.jsx");
const backup = path.join(__dirname, "src", "components", "WorkoutPlanner.before-cloud-sync.jsx.bak");

const original = fs.readFileSync(target, "utf8");
let code = original;

if (!fs.existsSync(backup)) {
  fs.copyFileSync(target, backup);
}

function replaceOne(before, after, label) {
  const count = code.split(before).length - 1;

  if (count !== 1) {
    throw new Error(`${label}: expected 1 match, found ${count}. Nothing was changed.`);
  }

  code = code.replace(before, after);
}

try {
  // Import cloud synchronization.
  const importLine =
    'import { saveWorkoutToMongoDB } from "../services/workoutPersistence";';

  replaceOne(
    importLine,
    `${importLine}
import { saveAdaptiveProgressToMongoDB } from "../services/adaptiveProgressSync";`,
    "Cloud sync import"
  );

  // Save completed workout's adaptive progress.
  replaceOne(
    `setTrainingState(result.state);
      setMessage("Workout saved to MongoDB Atlas and adaptive progress updated!");`,
    `setTrainingState(result.state);
      try {
        await saveAdaptiveProgressToMongoDB(result.state);
        setMessage("Workout and adaptive progress saved to MongoDB Atlas!");
      } catch (syncError) {
        console.error("Adaptive cloud sync failed:", syncError);
        setMessage("Workout saved. Adaptive cloud sync failed; please retry later.");
      }`,
    "Workout adaptive progress save"
  );

  // Save accepted training-level upgrades.
  replaceOne(
    `function handleUpgrade(group) {`,
    `async function handleUpgrade(group) {`,
    "Async upgrade handler"
  );

  replaceOne(
    `if (result.success) setTrainingState(result.state);`,
    `if (result.success) {
      setTrainingState(result.state);
      try {
        await saveAdaptiveProgressToMongoDB(result.state);
        setMessage("Training level upgraded and saved to MongoDB Atlas!");
      } catch (syncError) {
        console.error("Upgrade cloud sync failed:", syncError);
        setMessage("Level upgraded locally, but cloud sync failed.");
      }
    }`,
    "Upgrade cloud save"
  );

  fs.writeFileSync(target, code, "utf8");
  console.log("SUCCESS: Adaptive workout saving and level upgrades connected.");
} catch (error) {
  console.error("INTEGRATION STOPPED:", error.message);
  process.exitCode = 1;
}

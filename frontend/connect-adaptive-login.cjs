
/*
========================================
FITVERSE AI — ADAPTIVE LOGIN INTEGRATION
========================================
*/

const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "src",
  "App.jsx"
);

let code = fs.readFileSync(filePath, "utf8");

const original = code;

function replaceOnce(oldText, newText, label) {
  const count = code.split(oldText).length - 1;

  if (count !== 1) {
    throw new Error(
      `${label}: expected exactly one match, found ${count}. No changes saved.`
    );
  }

  code = code.replace(oldText, newText);
}

/*
========================================
1. IMPORT MONGODB SYNC SERVICE
========================================
*/

replaceOnce(
  'import "./App.css";',
  `import {
  loadAdaptiveProgressFromMongoDB
} from "./services/adaptiveProgressSync";

import "./App.css";`,
  "Add adaptive sync import"
);

/*
========================================
2. LOAD ADAPTIVE PROGRESS ON LOGIN
========================================
*/

replaceOnce(
  `      restoreTraining(userId);

      if (serverProfile) {`,
  `      restoreTraining(userId);

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

      if (serverProfile) {`,
  "Load cloud adaptive progress during login"
);

/*
========================================
3. REFRESH TRAINING STATE
========================================
*/

replaceOnce(
  `      setTrainingState(loadTrainingState());

      window.dispatchEvent(`,
  `      setTrainingState(loadTrainingState());

      window.dispatchEvent(
        new Event("fitverse-adaptive-progress-updated")
      );

      window.dispatchEvent(`,
  "Notify components after cloud load"
);

/*
========================================
4. WRITE ONLY AFTER VALIDATION
========================================
*/

if (code === original) {
  throw new Error("No changes were applied.");
}

fs.writeFileSync(filePath, code, "utf8");

console.log(
  "SUCCESS: App.jsx now loads adaptive progress from MongoDB on login."
);
console.log(
  "Existing dashboard and navigation preserved."
);


/*
========================================
FITVERSE AI — BACKEND API SERVICE
========================================
*/

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

// Store the login token for the current tab.
// Authentication state controls this token.
let accessToken = null;

export function setAccessToken(token) {
  accessToken =
    typeof token === "string" ? token : null;
}

export function clearAccessToken() {
  accessToken = null;
}

/*
========================================
SHARED REQUEST FUNCTION
========================================
*/

async function apiRequest(endpoint, options = {}) {
  const headers = {
    Accept: "application/json",
    ...options.headers
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers
      }
    );
  } catch {
    throw new Error(
      "Cannot connect to FitVerse AI server. Check that the backend is running."
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
}

/*
========================================
AUTHENTICATION API
========================================
*/

export const authAPI = {
  register(userData) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    });
  },

  login(credentials) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  },

  getCurrentUser() {
    return apiRequest("/auth/me");
  }
};

/*
========================================
STUDENT PROFILE API
========================================
*/

export const profileAPI = {
  get() {
    return apiRequest("/profile");
  },

  save(profileData) {
    return apiRequest("/profile", {
      method: "PUT",
      body: JSON.stringify(profileData)
    });
  }
};

/*
========================================
WORKOUT HISTORY API
========================================
*/

export const workoutAPI = {
  getAll() {
    return apiRequest("/workouts");
  },

  save(workoutData) {
    return apiRequest("/workouts", {
      method: "POST",
      body: JSON.stringify(workoutData)
    });
  }
};

/*
========================================
ADAPTIVE WORKOUT PROGRESS API
========================================
*/

export const adaptiveProgressAPI = {
  // Load the logged-in student's
  // training levels and feedback history.
  get() {
    return apiRequest("/adaptive-progress");
  },

  // Save updated adaptive training levels
  // and workout feedback to MongoDB Atlas.
  save(progressData) {
    return apiRequest("/adaptive-progress", {
      method: "PUT",
      body: JSON.stringify(progressData)
    });
  }
};

/*
========================================
HEALTH CHECK
========================================
*/

export const systemAPI = {
  health() {
    return apiRequest("/health");
  }
};

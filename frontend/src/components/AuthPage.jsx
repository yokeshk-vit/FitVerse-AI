
import { useState } from "react";

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap
} from "lucide-react";

import {
  authAPI,
  setAccessToken,
  clearAccessToken
} from "../services/api";

import "./AuthPage.css";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("register");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  }

  function changeMode(nextMode) {
    if (loading) return;

    setMode(nextMode);
    setError("");

    setForm({
      name: "",
      email: "",
      password: ""
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (mode === "register" && !name) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "register" && password.length < 8) {
      setError(
        "Please choose a password with at least 8 characters."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Clear any previous session token.
      clearAccessToken();

      let response;

      if (mode === "register") {
        response = await authAPI.register({
          name,
          email,
          password
        });
      } else {
        response = await authAPI.login({
          email,
          password
        });
      }

      if (
        !response.success ||
        !response.token ||
        !response.user
      ) {
        throw new Error(
          "Authentication failed. Please try again."
        );
      }

      // Store the JWT in memory for API requests.
      setAccessToken(response.token);

      // Pass the authenticated student to App.jsx.
      onLogin({
        ...response.user,
        isNewUser: mode === "register"
      });
    } catch (err) {
      clearAccessToken();

      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fvauth-page">
      <div className="fvauth-layout">

        {/* LEFT BRAND PANEL */}
        <section className="fvauth-brand-panel">

          <div className="fvauth-brand">
            <div className="fvauth-brand-icon">
              <HeartPulse size={29} />
            </div>

            <div>
              <strong>
                FITVERSE <span>AI</span>
              </strong>

              <small>
                INTELLIGENT FITNESS PLATFORM
              </small>
            </div>
          </div>

          <div className="fvauth-brand-content">

            <div className="fvauth-eyebrow">
              <span className="fvauth-live-dot" />
              YOUR PERSONAL FITNESS SPACE
            </div>

            <h1>
              YOUR JOURNEY.
              <br />
              <span>YOUR PACE.</span>
            </h1>

            <p>
              Welcome to FitVerse AI, your intelligent
              student fitness and wellness companion.
              Discover guided workouts, campus dining,
              progress insights, and fitness activities
              tailored to your preferences.
            </p>

            <div className="fvauth-feature-list">

              <div>
                <Dumbbell size={20} />
                <span>
                  Personalized Workout Studio
                </span>
                <CheckCircle2 size={17} />
              </div>

              <div>
                <Activity size={20} />
                <span>
                  Progress & Activity Tracking
                </span>
                <CheckCircle2 size={17} />
              </div>

              <div>
                <Sparkles size={20} />
                <span>
                  Smart Campus Meal Suggestions
                </span>
                <CheckCircle2 size={17} />
              </div>

              <div>
                <Zap size={20} />
                <span>
                  Adaptive Exercise Progression
                </span>
                <CheckCircle2 size={17} />
              </div>

            </div>
          </div>

          <div className="fvauth-brand-footer">
            <ShieldCheck size={18} />
            BUILT FOR STUDENT WELLNESS
          </div>

        </section>

        {/* RIGHT ENTRY PANEL */}
        <section className="fvauth-form-panel">

          <div className="fvauth-form-container">

            <div className="fvauth-form-icon">
              <UserRound size={29} />
            </div>

            <span className="fvauth-form-eyebrow">
              WELCOME TO FITVERSE AI
            </span>

            <h2>
              {mode === "register"
                ? "Create Your Profile"
                : "Welcome Back"}
            </h2>

            <p className="fvauth-form-description">
              {mode === "register"
                ? "Create your secure student account to get started."
                : "Sign in to access your FitVerse AI account."}
            </p>

            {/* LOGIN / REGISTER TABS */}
            <div className="fvauth-tabs">

              <button
                type="button"
                className={
                  mode === "register" ? "active" : ""
                }
                onClick={() => changeMode("register")}
                disabled={loading}
              >
                Create Profile
              </button>

              <button
                type="button"
                className={
                  mode === "login" ? "active" : ""
                }
                onClick={() => changeMode("login")}
                disabled={loading}
              >
                Sign In
              </button>

            </div>

            {/* AUTHENTICATION FORM */}
            <form
              className="fvauth-form"
              onSubmit={handleSubmit}
            >

              {mode === "register" && (
                <label>
                  <span>FULL NAME</span>

                  <div className="fvauth-input-wrap">
                    <UserRound size={19} />

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      maxLength={60}
                      disabled={loading}
                      required
                    />
                  </div>
                </label>
              )}

              <label>
                <span>EMAIL ADDRESS</span>

                <div className="fvauth-input-wrap">
                  <Mail size={19} />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </label>

              {/* PASSWORD */}
              <label>
                <span>PASSWORD</span>

                <div className="fvauth-input-wrap">
                  <LockKeyhole size={19} />

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                      mode === "register"
                        ? "Create a secure password"
                        : "Enter your password"
                    }
                    autoComplete={
                      mode === "register"
                        ? "new-password"
                        : "current-password"
                    }
                    minLength={
                      mode === "register" ? 8 : undefined
                    }
                    disabled={loading}
                    required
                  />
                </div>
              </label>

              {error && (
                <div
                  className="fvauth-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="fvauth-submit"
                disabled={loading}
              >
                {loading
                  ? "PLEASE WAIT..."
                  : mode === "register"
                    ? "CREATE MY ACCOUNT"
                    : "SIGN IN TO FITVERSE"}

                <ArrowRight size={19} />
              </button>

            </form>

            {/* SWITCH MODE */}
            <p className="fvauth-bottom-text">
              {mode === "register"
                ? "Already have an account?"
                : "New to FitVerse?"}

              <button
                type="button"
                onClick={() =>
                  changeMode(
                    mode === "register"
                      ? "login"
                      : "register"
                  )
                }
                disabled={loading}
              >
                {mode === "register"
                  ? "Sign In Here"
                  : "Create Account"}
              </button>
            </p>

            {/* SECURITY NOTE */}
            <div className="fvauth-security-note">
              <ShieldCheck size={17} />

              <span>
                Your account is authenticated through
                the FitVerse AI backend. Passwords are
                securely hashed before being stored.
              </span>
            </div>

          </div>

        </section>
      </div>
    </div>
  );
}


import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/auth";

function Auth({ onLogin, onClose }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/login" : "/register";

      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password };

      const response = await axios.post(
        `${API}${endpoint}`,
        payload
      );

      if (mode === "register") {
        setMessage("Registration successful! Please log in.");
        setMode("login");
        setPassword("");
      } else {
        localStorage.setItem(
          "shopEaseToken",
          response.data.token
        );

        localStorage.setItem(
          "shopEaseUser",
          JSON.stringify(response.data.user)
        );

        onLogin(response.data.user);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-section" id="account">
      <div className="auth-card">
        <h2>
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <p>
          {mode === "login"
            ? "Sign in to your ShopEase account."
            : "Register to start shopping."}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Password (minimum 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "login"
                ? "current-password"
                : "new-password"
            }
            minLength={8}
            required
          />

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="success-message" role="status">
              {message}
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In"
              : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            className="text-button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setMessage("");
            }}
          >
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </p>

        <button
          type="button"
          className="text-button"
          onClick={onClose}
        >
          Back to shopping
        </button>
      </div>
    </section>
  );
}

export default Auth;

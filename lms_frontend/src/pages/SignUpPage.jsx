import React, { useState } from "react";
import "../components/layout.css";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * SignUpPage: Email/password registration; emails a confirmation link when configured.
 */
export default function SignUpPage() {
  const { signUpWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [working, setWorking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setWorking(true);
    try {
      await signUpWithPassword(email, pw);
      setMsg("Sign up successful. Check your email to verify or continue.");
    } catch (e2) {
      setErr(e2?.message || "Sign up failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="vstack" style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1 className="page-title">Create your account</h1>
      <p className="page-subtitle">Join OceanLMS</p>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>{err}</div>}
      {msg && <div className="card" style={{ borderColor: "var(--color-secondary)" }}>{msg}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} className="vstack" style={{ gap: 12 }}>
          <label>
            <div className="page-subtitle" style={{ marginBottom: 4 }}>Email</div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
            />
          </label>
          <label>
            <div className="page-subtitle" style={{ marginBottom: 4 }}>Password</div>
            <input
              type="password"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Create a password"
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
            />
          </label>
          <div className="hstack" style={{ gap: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={working}>
              {working ? "Signing up..." : "Sign Up"}
            </button>
            <a className="btn btn-secondary" href="/signin">Already have an account</a>
          </div>
        </form>
      </div>
    </div>
  );
}

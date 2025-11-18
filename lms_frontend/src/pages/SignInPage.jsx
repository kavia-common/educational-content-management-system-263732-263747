import React, { useState } from "react";
import "../components/layout.css";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * SignInPage: Email/password sign-in with optional magic link and OAuth buttons.
 */
export default function SignInPage() {
  const { signInWithPassword, sendMagicLink, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [working, setWorking] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setWorking(true);
    try {
      await signInWithPassword(email, pw);
      window.location.replace(next);
    } catch (e2) {
      setErr(e2?.message || "Sign-in failed");
    } finally {
      setWorking(false);
    }
  };

  const handleMagic = async () => {
    setErr("");
    setMsg("");
    setWorking(true);
    try {
      await sendMagicLink(email);
      setMsg("Magic link sent. Check your email.");
    } catch (e2) {
      setErr(e2?.message || "Failed to send magic link");
    } finally {
      setWorking(false);
    }
  };

  const oauth = async (provider) => {
    setErr("");
    setMsg("");
    try {
      await signInWithOAuth(provider);
    } catch (e2) {
      setErr(e2?.message || "OAuth error");
    }
  };

  return (
    <div className="vstack" style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1 className="page-title">Sign in</h1>
      <p className="page-subtitle">Welcome back to OceanLMS</p>

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
              placeholder="••••••••"
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
            />
          </label>
          <div className="hstack" style={{ gap: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={working} aria-label="Sign in">
              {working ? "Signing in..." : "Sign In"}
            </button>
            <a className="btn btn-secondary" href="/signup" aria-label="Go to sign up">Create account</a>
          </div>
          <div className="hstack" style={{ gap: 8 }}>
            <button className="btn btn-secondary" type="button" onClick={handleMagic} disabled={working}>
              Send magic link
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="page-subtitle" style={{ marginBottom: 8 }}>Or continue with</div>
        <div className="hstack" style={{ gap: 8, flexWrap: "wrap" }}>
          <button className="btn" style={{ background: "#fff", border: "1px solid var(--color-border)" }} onClick={() => oauth("google")}>
            Google
          </button>
          <button className="btn" style={{ background: "#fff", border: "1px solid var(--color-border)" }} onClick={() => oauth("github")}>
            GitHub
          </button>
          <button className="btn" style={{ background: "#fff", border: "1px solid var(--color-border)" }} onClick={() => oauth("azure")}>
            Microsoft
          </button>
        </div>
        <div className="page-subtitle" style={{ marginTop: 8 }}>
          Note: OAuth provider configuration is managed in Supabase dashboard; no secrets exist in the frontend.
        </div>
      </div>
    </div>
  );
}

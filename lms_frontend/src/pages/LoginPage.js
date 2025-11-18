import React, { useMemo, useState } from "react";
import "../components/layout.css";
import { isSupabaseMode, signInWithEmail } from "../lib/supabaseClient";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /**
   * Login page:
   * - If Supabase mode is disabled, redirect to dashboard (guest mode).
   * - If enabled, show a minimal email form to request magic link.
   */
  const [email, setEmail] = useState("");
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const next = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/dashboard";
  }, []);

  const supabaseEnabled = (() => {
    try { return isSupabaseMode(); } catch { return false; }
  })();

  React.useEffect(() => {
    if (!supabaseEnabled) {
      window.location.replace(next);
    }
  }, [supabaseEnabled, next]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setWorking(true);
    setErr("");
    setMsg("");
    try {
      await signInWithEmail(email);
      setMsg("Check your email for a sign-in link.");
    } catch (e) {
      setErr(e?.message || "Sign-in failed");
    } finally {
      setWorking(false);
    }
  };

  if (!supabaseEnabled) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card">Authentication disabled. Redirecting...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div className="card" style={{ maxWidth: 420 }}>
        <h1 className="page-title">Sign in</h1>
        <p className="page-subtitle">Enter your email to receive a sign-in link</p>
        <form onSubmit={handleSubmit} className="vstack">
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
          <button type="submit" className="btn btn-primary" disabled={working}>
            {working ? "Sending..." : "Send magic link"}
          </button>
        </form>
        {msg && <div className="page-subtitle" style={{ marginTop: 8, color: "var(--color-primary)" }}>{msg}</div>}
        {err && <div className="page-subtitle" style={{ marginTop: 8, color: "var(--color-error)" }}>{err}</div>}
      </div>
    </div>
  );
}

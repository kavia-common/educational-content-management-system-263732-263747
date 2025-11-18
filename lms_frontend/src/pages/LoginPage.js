import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../components/layout.css";
import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /**
   * Login page supporting two modes:
   * - Backend proxy mode: buttons call login(provider) to redirect server-side.
   * - Supabase mode: inline email/password sign-in/up and magic link via Supabase JS.
   */
  const { login, refresh } = useAuth();
  const supaMode = isSupabaseMode();

  const { next, error } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      next: params.get("next") || "/dashboard",
      error: params.get("error"),
    };
  }, []);

  // Supabase mode states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState("");

  const handleProxyLogin = (provider = "email") => {
    login(provider);
  };

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    if (!supaMode) return handleProxyLogin("email");
    setWorking(true);
    setMsg("");
    try {
      const supabase = getSupabase();
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      await refresh();
      window.location.replace(next);
    } catch (e2) {
      setMsg(e2?.message || "Failed to sign in");
    } finally {
      setWorking(false);
    }
  };

  const handleEmailPasswordSignUp = async (e) => {
    e.preventDefault();
    if (!supaMode) return handleProxyLogin("email");
    setWorking(true);
    setMsg("");
    try {
      const supabase = getSupabase();
      // Optionally set emailRedirectTo to the site URL if provided
      const siteUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/oauth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (err) throw err;
      setMsg("Check your email for a confirmation link to complete sign up.");
    } catch (e2) {
      setMsg(e2?.message || "Failed to sign up");
    } finally {
      setWorking(false);
    }
  };

  const handleMagicLink = async () => {
    if (!supaMode) return handleProxyLogin("email");
    if (!email) {
      setMsg("Enter your email to receive a sign-in link.");
      return;
    }
    setWorking(true);
    setMsg("");
    try {
      const supabase = getSupabase();
      const siteUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${siteUrl}/oauth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (err) throw err;
      setMsg("Magic link sent! Check your email.");
    } catch (e2) {
      setMsg(e2?.message || "Failed to send magic link");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "var(--color-bg)", padding: 24 }}>
      <div className="card" style={{ maxWidth: 460, width: "100%" }}>
        <h1 className="page-title">Welcome to OceanLMS</h1>
        <p className="page-subtitle">Sign in to continue</p>

        {error && (
          <div className="card" style={{ borderColor: "var(--color-error)", marginBottom: 12 }}>
            Authentication error. Please try again.
          </div>
        )}

        {!supaMode && (
          <>
            <div className="vstack" style={{ marginTop: 8 }}>
              <button className="btn btn-primary" onClick={() => handleProxyLogin("email")} aria-label="Continue with email sign-in">Continue with Email</button>
              <button className="btn btn-secondary" onClick={() => handleProxyLogin("google")} aria-label="Continue with Google sign-in">Continue with Google</button>
            </div>
            <p className="page-subtitle" style={{ marginTop: 12 }}>After login, you will be redirected to: {next}</p>
          </>
        )}

        {supaMode && (
          <>
            <form className="vstack" onSubmit={handleEmailPasswordSignIn} style={{ marginTop: 8 }}>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
                />
              </label>
              <div className="hstack" style={{ gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={working} aria-label="Sign in with email and password">
                  {working ? "Signing in..." : "Sign In"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleEmailPasswordSignUp} disabled={working} aria-label="Create new account">
                  {working ? "Submitting..." : "Sign Up"}
                </button>
                <button type="button" className="btn" style={{ background: "#E5E7EB" }} onClick={handleMagicLink} disabled={working} aria-label="Send magic link">
                  {working ? "Sending..." : "Send Magic Link"}
                </button>
              </div>
            </form>
            {msg && <div className="page-subtitle" style={{ marginTop: 10 }}>{msg}</div>}
            <p className="page-subtitle" style={{ marginTop: 12 }}>After sign-in, you will be redirected to: {next}</p>
          </>
        )}
      </div>
    </div>
  );
}

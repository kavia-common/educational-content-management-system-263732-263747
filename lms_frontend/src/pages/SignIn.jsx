import { useState } from "react";
import { supabase } from "../supabaseClient";

// PUBLIC_INTERFACE
export default function SignIn() {
  /** Magic-link sign in using Supabase auth. */
  const [email, setEmail] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Magic link sent to your email!");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ocean-gradient p-4">
      <div className="card card-lg w-full max-w-md">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">Sign In</h2>
          <p className="text-[var(--color-muted)] mb-6">Receive a magic link to access your account</p>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input mb-4"
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={login}
            className="btn btn-primary w-full"
          >
            Send Login Link
          </button>
        </div>
      </div>
    </div>
  );
}

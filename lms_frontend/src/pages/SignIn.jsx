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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        <input
          type="email"
          className="w-full p-3 border rounded-lg mb-4"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={login}
          className="w-full bg-blue-600 text-white p-3 rounded-lg"
        >
          Send Login Link
        </button>
      </div>
    </div>
  );
}

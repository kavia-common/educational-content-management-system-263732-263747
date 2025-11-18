import { supabase } from "../supabaseClient";

// PUBLIC_INTERFACE
export default function Navbar() {
  /** Simple top nav with logout button for the simple LMS variant. */
  async function logout() {
    try {
      await supabase.auth.signOut();
    } catch (_) {
      // ignore
    }
    window.location.href = "/signin";
  }
  return (
    <div className="w-full bg-white shadow-md p-4 flex justify-end">
      <button
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}

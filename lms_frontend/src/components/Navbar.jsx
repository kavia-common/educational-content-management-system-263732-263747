import { supabase } from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * Navbar with Ocean Professional theme styling and error-accented logout.
 */
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
    <div className="ocean-navbar rounded-xl">
      <button
        className="btn btn-error rounded-lg"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}

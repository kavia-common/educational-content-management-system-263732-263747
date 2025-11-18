import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { isSupabaseMode, getSupabase } from "../lib/supabaseClient";

/**
 * PUBLIC_INTERFACE
 * Learning Paths page with Ocean Professional styling and loading/error states.
 * - Queries Supabase learning_paths table on mount.
 * - Uses anon/public key from env via existing supabase client factory.
 * - Displays friendly guidance if env vars are missing or Supabase mode disabled.
 * - Adds robust console logging for diagnostics and hints for RLS/auth issues.
 */
export default function LearningPaths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Derive environment readiness and client
  const supabaseEnv = useMemo(() => {
    const url = process.env.REACT_APP_SUPABASE_URL;
    const key = process.env.REACT_APP_SUPABASE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
    return { url, key, hasEnv: Boolean(url && key) };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function fetchPaths() {
      setLoading(true);
      setErr(null);

      // Feature flag and env checks with helpful messages
      if (!isSupabaseMode()) {
        const e = {
          code: "SUPABASE_MODE_DISABLED",
          message:
            "Supabase browser SDK is disabled. Enable it by setting FLAG_SUPABASE_MODE=true in REACT_APP_FEATURE_FLAGS.",
        };
        console.warn("[LearningPaths] Supabase mode disabled. Hints: set REACT_APP_FEATURE_FLAGS to {\"FLAG_SUPABASE_MODE\":true} or include FLAG_SUPABASE_MODE in a comma list.");
        setErr(e);
        setPaths([]);
        setLoading(false);
        return;
      }

      if (!supabaseEnv.hasEnv) {
        const e = {
          code: "SUPABASE_ENV_MISSING",
          message:
            "Missing Supabase configuration. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY (anon) in your environment.",
        };
        console.error("[LearningPaths] Missing env. Check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY. Do NOT use service_role in frontend.");
        setErr(e);
        setPaths([]);
        setLoading(false);
        return;
      }

      try {
        const client = getSupabase();

        // Fetch learning paths, order by created_at if exists
        const { data, error } = await client
          .from("learning_paths")
          .select("id,title,description,image_url,created_at");

        if (!isActive) return;
        if (error) throw error;

        setPaths(Array.isArray(data) ? data : []);
        console.info("[LearningPaths] Loaded", (data || []).length, "paths");
      } catch (e) {
        if (!isActive) return;

        // Add RLS/auth hints if common Supabase error codes/messages appear
        const msg = (e && (e.message || e.error_description)) || String(e);
        if (String(msg).toLowerCase().includes("permission") || String(e?.code).includes("PGRST")) {
          console.error(
            "[LearningPaths] RLS/auth may be blocking select on learning_paths. " +
              "Ensure RLS policy allows SELECT for anonymous or authenticated users based on your mode."
          );
        }
        console.error("[LearningPaths] Failed to fetch learning_paths:", e);
        setErr(e);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    fetchPaths();
    return () => {
      isActive = false;
    };
  }, [supabaseEnv.hasEnv]);

  const EmptyState = ({ title, message, actions }) => (
    <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">{title}</h2>
      <p className="text-[var(--color-muted)] mb-3">{message}</p>
      {actions}
    </div>
  );

  return (
    <div className="flex">
      <Sidebar />
      <div
        className="ml-64 w-full p-6 min-h-screen"
        style={{ background: "linear-gradient(180deg, rgba(37,99,235,0.06), rgba(249,250,251,1))" }}
      >
        <Navbar />
        <h1 className="text-3xl font-bold mb-1 text-[var(--color-text)]">Learning Paths</h1>
        <p className="text-[var(--color-muted)] mb-6">Curated sequences of courses</p>

        {loading && (
          <div className="card p-4 text-[var(--color-muted)] rounded-xl bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)]">
            Loading learning paths...
          </div>
        )}

        {!loading && err && (
          <EmptyState
            title="We couldn't load learning paths"
            message={
              err?.message ||
              "An unexpected error occurred while fetching learning paths. Please try again."
            }
            actions={
              <div className="flex gap-3 mt-2">
                <button
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "var(--color-primary)", boxShadow: "var(--shadow)" }}
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
                <details className="text-sm text-[var(--color-muted)]">
                  <summary>Error details</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {(err && (err.code || err.status) ? `[${err.code || err.status}] ` : "") +
                      (err?.message || String(err))}
                  </pre>
                  <div className="mt-2">
                    <p className="text-[var(--color-muted)]">
                      Troubleshooting:
                      <ul className="list-disc ml-5">
                        <li>Verify REACT_APP_FEATURE_FLAGS includes FLAG_SUPABASE_MODE=true.</li>
                        <li>Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY (anon) env vars.</li>
                        <li>Confirm table name is learning_paths and columns: id, title, description, image_url.</li>
                        <li>
                          If using RLS, ensure SELECT policy allows your current auth context (anon or authenticated).
                        </li>
                      </ul>
                    </p>
                  </div>
                </details>
              </div>
            }
          />
        )}

        {!loading && !err && paths.length === 0 && (
          <EmptyState
            title="No learning paths yet"
            message="Once you add learning paths in your Supabase database, they will appear here."
            actions={
              <div className="text-sm text-[var(--color-muted)]">
                <ol className="list-decimal ml-5">
                  <li>Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY (anon) are set.</li>
                  <li>Create a table named learning_paths with columns: id, title, description, image_url.</li>
                  <li>Insert sample rows to preview cards in the UI.</li>
                </ol>
              </div>
            }
          />
        )}

        {!loading && !err && paths.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paths.map((p) => (
              <div
                key={p.id}
                className="card p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-shadow"
                style={{ boxShadow: "var(--shadow)" }}
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    className="rounded-lg mb-4 w-full h-36 object-cover border"
                    style={{ borderColor: "var(--color-border)" }}
                    alt=""
                  />
                ) : (
                  <div
                    className="rounded-lg mb-4 w-full h-36 grid place-items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(245,158,11,0.12))",
                      color: "var(--color-muted)",
                      border: "1px solid var(--color-border)",
                    }}
                    aria-hidden
                  >
                    No image
                  </div>
                )}
                <h2 className="text-xl font-semibold text-[var(--color-text)]">{p.title}</h2>
                <p className="text-[var(--color-muted)]">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

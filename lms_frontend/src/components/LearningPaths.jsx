import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Card from "./common/Card";

/**
 * PUBLIC_INTERFACE
 * LearningPaths
 * Fetches learning_paths from Supabase and displays as a responsive grid of cards.
 * Card fields: image_url (optional), title, description
 */
export default function LearningPaths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("learning_paths")
          .select("id, title, description, image_url")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (mounted) setPaths(Array.isArray(data) ? data : []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[LearningPaths] fetch error", e);
        if (mounted) setErr(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onClick = (id) => navigate(`/paths/${id}`);

  return (
    <div>
      {err && (
        <Card>
          <div style={{ color: "var(--color-error)" }}>
            Failed to load learning paths. Please check your configuration.
          </div>
        </Card>
      )}
      {loading && <Card>Loading...</Card>}

      <div className="grid cols-3" style={{ marginTop: 8 }}>
        {paths.map((p) => (
          <Card key={p.id}>
            <button
              onClick={() => onClick(p.id)}
              className="hstack"
              style={{
                gap: 12,
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: 0,
                padding: 0,
                cursor: "pointer",
              }}
              aria-label={`View path ${p.title || p.id}`}
            >
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt=""
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid var(--color-border)",
                  }}
                />
              ) : (
                <div
                  aria-hidden
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    background:
                      "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(245,158,11,0.15))",
                    border: "1px solid var(--color-border)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--color-muted)",
                    fontWeight: 700,
                  }}
                >
                  {(p.title || "LP").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "4px 0 6px", color: "var(--color-text)" }}>
                  {p.title || "Learning Path"}
                </h3>
                <p className="page-subtitle" style={{ margin: 0 }}>
                  {p.description || "Curated set of courses"}
                </p>
              </div>
            </button>
          </Card>
        ))}
        {paths.length === 0 && !loading && !err && (
          <Card>No learning paths found.</Card>
        )}
      </div>
    </div>
  );
}

export const theme = {
  name: "Ocean Professional",
  colors: {
    primary: "#2563EB",
    secondary: "#F59E0B",
    success: "#F59E0B",
    error: "#EF4444",
    background: "#f9fafb",
    surface: "#ffffff",
    text: "#111827",
    muted: "#6B7280",
    border: "#E5E7EB"
  },
  shadow: "0 4px 12px rgba(0,0,0,0.06)",
  radius: "12px",
};

// PUBLIC_INTERFACE
export function applyCssVariables() {
  /** Apply theme colors as CSS variables on :root for easy styling. */
  const root = document.documentElement;
  const set = (k, v) => root.style.setProperty(k, v);
  set("--color-primary", theme.colors.primary);
  set("--color-secondary", theme.colors.secondary);
  set("--color-error", theme.colors.error);
  set("--color-text", theme.colors.text);
  set("--color-muted", theme.colors.muted);
  set("--color-bg", theme.colors.background);
  set("--color-surface", theme.colors.surface);
  set("--color-border", theme.colors.border);
  set("--radius", theme.radius);
  set("--shadow", theme.shadow);
}

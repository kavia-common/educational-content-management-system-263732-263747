module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens
        primary: "#2563EB",
        secondary: "#F59E0B",
        success: "#10B981",
        error: "#EF4444",
        background: "#f9fafb",
        surface: "#ffffff",
        text: "#111827",
        muted: "#6B7280",
        border: "#E5E7EB",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        ocean: "0 4px 12px rgba(0,0,0,0.06)",
        "ocean-lg": "0 10px 25px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "ocean-gradient": "linear-gradient(to bottom, rgba(59,130,246,0.10), rgba(249,250,251,1))",
        "ocean-hero": "linear-gradient(90deg, rgba(37,99,235,0.98), rgba(37,99,235,0.82))",
      },
      ringColor: {
        primary: "#2563EB",
      },
    },
  },
  plugins: [],
};

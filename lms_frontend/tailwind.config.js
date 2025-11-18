module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#F59E0B",
        success: "#F59E0B",
        error: "#EF4444",
        background: "#f9fafb",
        surface: "#ffffff",
        text: "#111827",
      },
      backgroundImage: {
        "ocean-gradient": "linear-gradient(to bottom, rgba(59,130,246,0.1), rgba(249,250,251,1))",
      },
    },
  },
  plugins: [],
};

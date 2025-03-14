module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // ✅ Ensure Tailwind scans the correct files
  theme: {
    extend: {
      fontFamily: {
        spotify: ['"Circular", "Spotify Circular", "Helvetica", "Arial", sans-serif'], // ✅ Correct Font Family
      },
    },
  },
  plugins: [],
};
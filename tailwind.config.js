/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: "#F6F1EA",
        ink: "#161616",
        muted: "#7B746B",
        violet: "#5B3FFF",
        deep: "#21125E",
        gold: "#D8B56D",
        danger: "#E5484D",
        success: "#1F9D55",
      },
    },
  },
  plugins: [],
};

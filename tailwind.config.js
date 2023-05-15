import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      typography(theme) {
        return {
          DEFAULT: {
            css: {
              "code::before": {
                content: "none",
              },
              "code::after": {
                content: "none",
              },
            },
          },
        };
      },
      colors: {
        gray: colors.stone,
      },
      height: {
        dscreen: "100dvh",
      },
      width: {
        dscreen: "100dvw",
      },
      minHeight: {
        dscreen: "100dvh",
      },
      minWidth: {
        dscreen: "100dvw",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};

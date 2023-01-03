const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      maxWidth: {
        cell: "19.5rem",
      },
      minHeight: {
        toolbar: "70%",
      },
    },
    fontFamily: {
      montserrat: ["Montserrat", "sans-serif"],
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("error", '&[data-error="true"]');
      addVariant("selected", '&[data-selected="true"]');
    }),
  ],
};

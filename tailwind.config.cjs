/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,js,svelte,ts}", "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      mono: [
        "ui-monospace",
        `"Fira Code"`,
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        `"Liberation Mono"`,
        `"Courier New"`,
        "monospace",
      ],
    },
    extend: {
      fontSize: {
        sm: ["12px", "16px"],
        base: ["14px", "20px"],
        lg: ["16px", "24px"],
        xl: ["19px", "28px"],
        "3xl": ["27px", "32px"],
      },
      colors: {
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          800: "#030712",
          900: "#103830",
        },
        gobl: {
          50: "#15C6F6",
          300: "#38455B",
          900: "#212936",
        },
        accent: {
          500: "#169958",
        },
        positive: {
          500: "#45A557",
        },
        danger: {
          200: "#E5484D66",
          500: "#DA2F35",
        },
        // flowbite-svelte
        primary: {
          50: "#FFF5F2",
          100: "#FFF1EE",
          200: "#FFE4DE",
          300: "#FFD5CC",
          400: "#FFBCAD",
          500: "#FE795D",
          600: "#EF562F",
          700: "#EB4F27",
          800: "#CC4522",
          900: "#A5371B",
        },
      },
      letterSpacing: {
        tightest: "-0.567px",
        tighter: "-0.16px",
        tight: "-0.135px",
        normal: "-0.07px",
        wide: "0.055px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require("@tailwindcss/container-queries"),
  ],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,js,svelte,ts}", "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      mono: [
        "CommitMono",
        "ui-monospace",
        "Menlo",
        "Monaco",
        "Consolas",
        '"Ubuntu Mono"',
        '"Roboto Mono"',
        '"DejaVu Sans Mono"',
        "monospace",
      ],
    },
    extend: {
      fontSize: {
        xs: ["12px", "16px"],
        sm: ["14px", "18px"],
        base: ["16px", "22px"],
        lg: ["18px", "26px"],
        xl: ["21px", "30px"],
        "3xl": ["32px", "38px"],
      },
      colors: {
        workspace: {
          accent: {
            DEFAULT: "var(--workspace-accent-color, #169958)",
            50: "color-mix(in lab, transparent 95%, var(--workspace-accent-color, #169958))",
            100: "color-mix(in lab, transparent 90%, var(--workspace-accent-color, #169958))",
            200: "color-mix(in lab, transparent 80%, var(--workspace-accent-color, #169958))",
            500: "var(--workspace-accent-color, #169958)",
          },
        },
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
      boxShadow: {
        active: "0px 0px 0px 2px color-mix(in lab, transparent 88%, var(--workspace-accent-color, #169958))",
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

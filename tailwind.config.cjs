/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}", "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}"],
  theme: {
    fontFamily: {
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
      colors: {
        grey: {
          1: "#EFEFEF",
          2: "#DBDBDB",
          3: "#B9B9B7",
          4: "#373530",
          5: "#787774",
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
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
};

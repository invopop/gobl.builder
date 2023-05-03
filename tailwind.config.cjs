/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
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
      boxShadow: {
        'right': '1px 1px 2px 1px rgba(0, 0, 0, 0.04)',
        'left': '-1px 1px 2px 1px rgba(0, 0, 0, 0.04)',
      },
      colors: {
        white: '#ffffff',
        transparent: 'transparent',
        color1: '#F8FAFC',
        color2: '#DBE0E3',
        color3: '#F4F7F9',
        color4: '#394150',
        color5: '#ECEFF1',
        grey: {
          1: '#EFEFEF',
          2: '#DBDBDB',
          3: '#B9B9B7',
          4: '#373530',
          5: '#787774',
        },
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
};

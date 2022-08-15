<img src="https://github.com/invopop/gobl/blob/main/gobl_logo_black_rgb.svg?raw=true" width="80" alt="GOBL Logo">

# gobl.builder

**GOBL Builder** is an interactive, low code tool for building GOBL documents.

It's built using [Svelte](https://svelte.dev/).
The main Svelte component, [`GoblBuilder`](src/GoblBuilder.svelte), is used to
render a self-contained UI with menu bar, toolbar, code editor and bottom drawer
for showing errors, warnings and more.

For hosting on https://build.gobl.org, this component is invoked from a thin
`src/main.ts`, which itself is called from `index.html`.

ℹ️ Soon, the `GoblBuilder` Svelte component will be distributed as an NPM
package, to be used in the [Console](https://github.com/invopop/console-ui).

## Demo

A publically hosted demo is available at: https://build.gobl.org.

## Installation

Clone this repository from GitHub, then run from the repo directory:

```sh
npm install
```

This installs (dev) package dependencies needed to develop and test the project.

For an optimal developer experience, use an IDE with plugin support for Svelte,
TypeScript, ESLint and Prettier. For VS Code, recommended plugins are included
in `.vscode/extensions.json`.

## Usage

### Development

```sh
npm run dev
```

This uses `vite` to run a development web server with
[HMR](https://vitejs.dev/guide/features.html#hot-module-replacement). It
compiles TypeScript to JavaScript and serves the app on http://localhost:3000.

### Build

```sh
npm run build
```

This uses `vite` to createsa build optimized for production in the `dist`
directory.

### Preview production build

```sh
npm run preview
```

This uses `vite` to serve a previously built `dist` folder on
http://localhost:4173.

## License

GOBL Builder is currently **unlicenced**.

---

© 2022 Invopop, Ltd.

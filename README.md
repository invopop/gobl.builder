<img src="https://github.com/invopop/gobl/blob/main/gobl_logo_black_rgb.svg?raw=true" width="80" alt="GOBL Logo">

# gobl.builder

**GOBL Builder** is an interactive, low code tool for building GOBL documents.

## Requirements

- Node.js (used for `npm`)

For an optimal developer experience, use an IDE with plugin support for Svelte,
TypeScript, ESLint and Prettier. For VS Code, recommended plugins are included
in `.vscode/extensions.json`.

## Installation

Clone this repository from GitHub, then run from the repo directory:

```sh
npm install
```

This installs (dev) package dependencies needed to develop and test the project.

## Usage

### Running in development mode

```sh
npm run dev
```

This uses `vite` to run a development web server with
[HMR](https://vitejs.dev/guide/features.html#hot-module-replacement). It
compiles TypeScript to JavaScript and serves the app on http://localhost:3000.

### Building for production

```sh
npm run build
```

This uses `vite` to createsa build optimized for production in the `dist`
directory.

### Previewing a production build

```sh
npm run preview
```

This uses `vite` to serve a previously built `dist` folder on
http://localhost:4173.

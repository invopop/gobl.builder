<img src="https://github.com/invopop/gobl/blob/main/gobl_logo_black_rgb.svg?raw=true" width="80" alt="GOBL Logo">

# gobl.builder

**GOBL Builder** is an interactive, low code tool for building GOBL documents.

This repository contains a [`GOBLBuilder`](src/lib/GOBLBuilder.svelte) Svelte component in the `src/lib`
directory. This component is packaged via [SvelteKit](https://kit.svelte.dev/),
to be imported and used from another Svelte project (e.g. `console-ui`).

The main Svelte component, [`GOBLBuilder`](src/GOBLBuilder.svelte), is used to
render a self-contained UI with menu bar, toolbar, code editor and bottom drawer
for showing errors, warnings and more.

A standalone wrapper for `GOBLBuilder` is included in this repository in `src` (not part of the packaged library). It's available at https://build.gobl.org.

## Installation

Clone this repository from GitHub, then run from the repo directory:

```sh
npm install
```

For an optimal developer experience, use an IDE with plugin support for Svelte,
TypeScript, ESLint and Prettier. For VS Code, recommended plugins are included
in `.vscode/extensions.json`.

## Usage

_TODO: Write instructions for using NPM package, once packaging is done._

## Development

### Run in watch mode

```sh
npm run dev
```

This uses `vite` to run a development web server with
[HMR](https://vitejs.dev/guide/features.html#hot-module-replacement). It
compiles TypeScript to JavaScript and serves the demo wrapper on
http://localhost:3000.

### Build package

```sh
npm run build:package
```

This uses `svelte-package` to build a component library, written to the
`package` directory ([ref](https://kit.svelte.dev/docs/packaging)).

### Build standalone demo

```sh
npm run build
```

This uses `vite` to build and write an optimized for production of the
standalone demo to the `build` directory.

### Preview production build

```sh
npm run preview
```

This uses `vite` to serve a previously built `build` folder on
http://localhost:4173.

## License

[Apache License, Version 2.0](LICENSE)

---

© 2022 Invopop, Ltd.

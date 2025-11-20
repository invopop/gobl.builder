<img src="https://github.com/invopop/gobl/blob/main/gobl_logo_black_rgb.svg?raw=true" width="80" alt="GOBL Logo">

# gobl.builder

**GOBL Builder** is an interactive, low code tool for building GOBL documents.

This repository contains [`GOBLBuilder`](src/lib/GOBLBuilder.svelte), a Svelte
component used to render a self-contained UI with menu bar, toolbar, code editor
and bottom drawer for showing errors, warnings and more. The component is
packaged publically on NPM, to be imported and used from Svelte projects.

A standalone wrapper for `GOBLBuilder` is included in this repository in `src`
(not part of the packaged library). It's available at https://build.gobl.org.

## Requirements

At the moment, the component library relies on [Tailwind
CSS](https://tailwindcss.com/) for styling. This might change in the future.

## Installation

GOBL Builder is released as
[@invopop/gobl-builder](https://www.npmjs.com/package/@invopop/gobl-builder) on
NPM. To add it to your Svelte project:

```sh
npm add -D @invopop/gobl-builder
```

Assuming your project already is configured to use Tailwind CSS, configure its
template paths to include the component library and Flowbite (its dependency).
An example `tailwind.config.cjs` file:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/@invopop/gobl-builder/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
```

## Usage

Import and use the `EnvelopeEditor` Svelte component. For example, using
TypeScript:

```html
<script lang="ts">
  import { EnvelopeEditor } from '@invopop/gobl-builder'
</script>

<EnvelopeEditor data="" jsonSchemaURL="https://gobl.org/draft-0/bill/invoice" />
```

For further example usage, including directives for event handling, see
[src/routes/+page.svelte](src/routes/+page.svelte).

## Development

Below sections cover development of the component library itself. See above
sections for instructions on using GOBL Builder in your own project.

### Installation

Clone this repository from GitHub, then run from within its directory:

```sh
npm install
```

For an optimal developer experience, use an IDE with plugin support for Svelte,
TypeScript, ESLint and Prettier. For VS Code, recommended plugins are included
in `.vscode/extensions.json`.

### Run in watch mode

```sh
npm run dev
```

This script uses `vite` to run a development web server with
[HMR](https://vitejs.dev/guide/features.html#hot-module-replacement). It
compiles TypeScript to JavaScript and serves the demo wrapper on
http://localhost:3000.

### Build package

```sh
npm run build:package
```

This script uses `svelte-package` to build a component library, written to the
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

### GOBL WASM binary

GOBL Builder makes use of [gobl cli](https://github.com/invopop/gobl?tab=readme-ov-file#cli) for
validating, calculating and building GOBL documents. This is done using the [@invopop/gobl-worker](https://www.npmjs.com/package/@invopop/gobl-worker) package that prepares a Worker and uses the WASM binary distributed on `cdn.gobl.org`.

To upgrade the version of the GOBL worker currently in use, simply update the [package.json](./package.json) file to reflect the new version.

## License

GOBL Builder is licensed under the [Apache-2.0 License](LICENSE).

---

© 2024 Invopop, S.L.

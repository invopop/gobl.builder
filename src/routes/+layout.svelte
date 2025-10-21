<script lang="ts">
  import 'inter-ui/inter.css'
  import '../app.css'
  import '../app.css'
  import type { Snippet } from 'svelte'
  import { Toaster } from '../components/ui/sonner'
  interface Props {
    children?: Snippet
  }

  let { children }: Props = $props()
</script>

<svelte:head>
  <script defer data-domain="build.gobl.org" src="https://plausible.io/js/script.js"></script>
</svelte:head>

<Toaster richColors />

{@render children?.()}

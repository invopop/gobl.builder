import GoblBuilder from "./GoblBuilder.svelte";
import "./index.css";

const app = new GoblBuilder({
  target: document.getElementById("app") as HTMLElement,
});

export default app;

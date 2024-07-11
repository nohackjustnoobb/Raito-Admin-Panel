import "./app.css";

import App from "./App.svelte";
import { setDarkMode } from "./lib/utils";
// Setup the locale
import * as _ from "./locales/i18n";

// Setup the theme settings
setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches }) => setDarkMode(matches));

// Main entry point
const app = new App({
  target: document.getElementById("app")!,
});

export default app;

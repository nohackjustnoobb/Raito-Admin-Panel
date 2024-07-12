import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

import { svelte } from "@sveltejs/vite-plugin-svelte";

const file = fileURLToPath(new URL("package.json", import.meta.url));
const json = readFileSync(file, "utf8");
const pkg = JSON.parse(json);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  define: {
    PKG: pkg,
  },
});

import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs"],
    splitting: false,
    clean: true,
    minify: true,
    shims: true,
  },
]);

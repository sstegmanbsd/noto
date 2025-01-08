import { resolve } from "path";

import { defineConfig } from "tsup";
import alias from "esbuild-plugin-alias";

export default defineConfig({
  entry: ["src/cli.ts"],
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  splitting: false,
  minify: true,
  sourcemap: true,
  target: "node16",
  esbuildPlugins: [
    alias({
      "@": resolve(__dirname, "src"),
      package: resolve(__dirname, "package.json"),
    }),
  ],
});

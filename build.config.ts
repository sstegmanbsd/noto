import { defineBuildConfig } from "unbuild";
import { resolve } from "node:path";

export default defineBuildConfig({
  entries: ["src/cli.ts"],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  alias: {
    "@": resolve(__dirname, "src"),
  },
});

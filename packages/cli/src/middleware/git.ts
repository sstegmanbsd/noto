import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { isGitRepository } from "@/utils/git";

import type { Command } from "@/types";

export const withRepository = (fn: Command["execute"]): Command["execute"] => {
  return async (options) => {
    const isRepo = await isGitRepository();
    if (!isRepo) {
      p.log.error(
        dedent`${color.red("no git repository found in cwd.")}
        ${color.dim(`run ${color.cyanBright("`git init`")} to initialize a new repository.`)}`
      );
      console.log();
      process.exit(1);
    }
    return fn(options);
  };
};

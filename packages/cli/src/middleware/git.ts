import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { getStagedDiff, isGitRepository } from "@/utils/git";

import type { Command } from "@/types";

export const withRepository = (fn: Command["execute"]): Command["execute"] => {
  return async (options) => {
    const isRepo = await isGitRepository();
    if (!isRepo) {
      p.log.error(
        dedent`${color.red("no git repository found in cwd.")}
        ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`
      );
      console.log();
      process.exit(1);
    }

    const diff = await getStagedDiff();
    if (!diff) {
      p.log.error(
        dedent`${color.red("no staged changes found.")}
        ${color.dim(`run ${color.cyan("`git add <file>`")} or ${color.cyan("`git add .`")} to stage changes.`)}`
      );
      console.log();
      process.exit(1);
    }

    options.diff = diff;

    return fn(options);
  };
};

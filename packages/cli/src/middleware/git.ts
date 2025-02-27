import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { getStagedDiff, isGitRepository } from "@/utils/git";
import { exit } from "@/utils/process";

import type { Command } from "@/types";
interface WithRepositoryOptions {
  silent?: boolean;
}

export const withRepository = (
  fn: Command["execute"],
  options: WithRepositoryOptions = {}
): Command["execute"] => {
  return async (opts) => {
    const isRepo = await isGitRepository();
    if (!isRepo && !options.silent) {
      p.log.error(
        dedent`${color.red("no git repository found in cwd.")}
        ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`
      );
      return await exit(1);
    }

    opts.isRepo = isRepo;

    const diff = await getStagedDiff();
    if (!diff && !options.silent) {
      p.log.error(
        dedent`${color.red("no staged changes found.")}
        ${color.dim(`run ${color.cyan("`git add <file>`")} or ${color.cyan("`git add .`")} to stage changes.`)}`
      );
      return await exit(1);
    }

    opts.diff = diff;

    return fn(opts);
  };
};

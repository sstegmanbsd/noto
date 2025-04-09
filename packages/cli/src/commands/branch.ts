import * as p from "@clack/prompts";
import color from "picocolors";

import clipboard from "clipboardy";
import dedent from "dedent";

import { withRepository } from "@/middleware/git";

import { getBranches, getCurrentBranch } from "@/utils/git";
import { exit } from "@/utils/process";

import type { Command } from "@/types";

const current: Command = {
  name: "current",
  description: "get current branch",
  usage: "branch current",
  options: [
    {
      type: Boolean,
      flag: "--copy",
      alias: "-c",
      description: "copy the selected branch to clipboard",
    },
  ],
  execute: withRepository(
    async (options) => {
      if (!options.isRepo) {
        p.log.error(
          dedent`${color.red("no git repository found in cwd.")}
            ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`
        );
        return await exit(1);
      }

      const branch = await getCurrentBranch();

      if (!branch) {
        p.log.error("failed to fetch current branch");
        return await exit(1);
      }

      p.log.success(`current branch: ${color.bold(branch)}`);

      if (options["--copy"]) {
        clipboard.writeSync(branch);
        p.log.success(`${color.green("copied to clipboard!")}`);
      }

      await exit(0);
    },
    { enabled: false }
  ),
};

const command: Command = {
  name: "branch",
  description: "list branches",
  usage: "branch [options]",
  options: [
    {
      type: Boolean,
      flag: "--remote",
      alias: "-r",
      description: "list branches including remotes",
    },
  ],
  execute: withRepository(
    async (options) => {
      if (!options.isRepo) {
        p.log.error(
          dedent`${color.red("no git repository found in cwd.")}
            ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`
        );
        return await exit(1);
      }

      const remote = options["--remote"];

      const branches = await getBranches(remote);
      const currentBranch = await getCurrentBranch();

      if (!branches) {
        p.log.error("failed to fetch branches");
        return await exit(1);
      }

      const branch = await p.select({
        message: "select a branch",
        options: branches.map((branch) => ({
          value: branch,
          label: color.bold(
            branch === currentBranch ? color.green(branch) : branch
          ),
          hint: branch === currentBranch ? "current branch" : undefined,
        })),
        initialValue: currentBranch,
      });

      if (p.isCancel(branch)) {
        p.log.error("nothing selected!");
        return await exit(1);
      }

      if (!branch) {
        p.log.error("no branch selected");
        return await exit(1);
      }

      clipboard.writeSync(branch);
      p.log.success(`${color.green("copied to clipboard!")}`);

      await exit(0);
    },
    { enabled: false }
  ),
  subCommands: [current],
};

export default command;

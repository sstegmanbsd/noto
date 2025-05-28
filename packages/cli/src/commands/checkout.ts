import * as p from "@clack/prompts";
import color from "picocolors";

import clipboard from "clipboardy";
import dedent from "dedent";

import { withRepository } from "~/middleware/git";

import { checkout, getCurrentBranch, getBranches } from "~/utils/git";
import { exit } from "~/utils/process";

import type { Command } from "~/types";

const command: Command = {
  name: "checkout",
  description: "checkout a branch",
  usage: "checkout [options]",
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
      const args = options._.slice(1);

      if (!options.isRepo) {
        p.log.error(
          dedent`${color.red("no git repository found in cwd.")}
            ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`
        );
        return await exit(1);
      }

      const branches = await getBranches();
      if (!branches) {
        p.log.error("failed to fetch branches");
        return await exit(1);
      }

      const currentBranch = await getCurrentBranch();

      const branchName = args[0];
      if (branchName) {
        if (!branches.includes(branchName)) {
          p.log.error(
            `branch ${color.red(branchName)} does not exist in the repository`
          );
          return await exit(1);
        }

        if (branchName === currentBranch) {
          p.log.error(
            `${color.red("already on branch")} ${color.green(branchName)}`
          );
          return await exit(1);
        }

        const result = await checkout(branchName);
        if (!result) {
          p.log.error(`failed to checkout ${color.bold(branchName)}`);
          return await exit(1);
        }

        p.log.success(`checked out ${color.green(branchName)}`);
        return await exit(0);
      }

      const branch = await p.select({
        message: "select a branch to checkout",
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

      if (options["--copy"]) {
        clipboard.writeSync(branch);
        p.log.success(`copied ${color.green(branch)} to clipboard`);
        return await exit(0);
      }

      if (branch === currentBranch) {
        p.log.error(`${color.red("already on branch")}`);
        return await exit(1);
      }

      const result = await checkout(branch!);
      if (!result) {
        p.log.error(`failed to checkout ${color.bold(branch)}`);
        return await exit(1);
      }

      p.log.success(`checked out ${color.green(branch)}`);
      await exit(0);
    },
    { enabled: false }
  ),
};

export default command;

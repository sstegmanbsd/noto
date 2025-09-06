import { z } from "trpc-cli";

import * as p from "@clack/prompts";
import color from "picocolors";

import clipboard from "clipboardy";

import { gitProcedure } from "~/trpc";

import {
  checkout as checkoutBranch,
  getCurrentBranch,
  getBranches,
  checkoutLocalBranch,
} from "~/utils/git";
import { exit } from "~/utils/process";

export const checkout = gitProcedure
  .meta({
    description: "checkout a branch",
  })
  .input(
    z.object({
      copy: z
        .boolean()
        .meta({
          description: "copy the selected branch to clipboard",
          alias: "c",
        }),
      create: z
        .boolean()
        .meta({ description: "create a new branch", alias: "b" }),
      branch: z.string().optional().meta({ positional: true }),
    }),
  )
  .mutation(async (opts) => {
    const { input } = opts;

    const branches = await getBranches();
    if (!branches) {
      p.log.error("failed to fetch branches");
      return await exit(1);
    }

    const currentBranch = await getCurrentBranch();

    const branchName = input.branch;

    if (input.create && branchName) {
      if (branches.includes(branchName)) {
        p.log.error(
          `branch ${color.red(branchName)} already exists in the repository`,
        );
        return await exit(1);
      }

      const result = await checkoutLocalBranch(branchName);
      if (!result) {
        p.log.error(`failed to create and checkout ${color.bold(branchName)}`);
        return await exit(1);
      }

      p.log.success(`created and checked out ${color.green(branchName)}`);
      return await exit(0);
    }

    if (branchName) {
      if (!branches.includes(branchName)) {
        p.log.error(
          `branch ${color.red(branchName)} does not exist in the repository`,
        );

        const createBranch = await p.confirm({
          message: `do you want to create branch ${color.green(branchName)}?`,
        });

        if (p.isCancel(createBranch)) {
          p.log.error("aborted");
          return await exit(1);
        }

        if (createBranch) {
          const result = await checkoutLocalBranch(branchName);
          if (!result) {
            p.log.error(
              `failed to create and checkout ${color.bold(branchName)}`,
            );
            return await exit(1);
          }

          p.log.success(`created and checked out ${color.green(branchName)}`);
          return await exit(0);
        }

        return await exit(1);
      }

      if (branchName === currentBranch) {
        p.log.error(
          `${color.red("already on branch")} ${color.green(branchName)}`,
        );
        return await exit(1);
      }

      const result = await checkoutBranch(branchName);
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
          branch === currentBranch ? color.green(branch) : branch,
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

    if (input.copy) {
      clipboard.writeSync(branch);
      p.log.success(`copied ${color.green(branch)} to clipboard`);
      return await exit(0);
    }

    if (branch === currentBranch) {
      p.log.error(`${color.red("already on branch")}`);
      return await exit(1);
    }

    const result = await checkoutBranch(branch!);
    if (!result) {
      p.log.error(`failed to checkout ${color.bold(branch)}`);
      return await exit(1);
    }

    p.log.success(`checked out ${color.green(branch)}`);
    await exit(0);
  });

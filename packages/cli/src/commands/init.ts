import fs from "node:fs/promises";

import { z } from "trpc-cli";

import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { gitProcedure } from "~/trpc";

import { getPromptFile } from "~/utils/prompt";
import { exit } from "~/utils/process";
import { getGitRoot } from "~/utils/git";

export const init = gitProcedure
  .meta({
    description: "initialize noto in the repository",
  })
  .input(
    z.object({
      root: z.boolean().meta({
        description: "create the prompt file in the git root",
      }),
      generate: z.boolean().meta({
        description: "generate a prompt file based on existing commits",
      }),
    }),
  )
  .mutation(async (opts) => {
    const { input } = opts;

    const root = await getGitRoot();

    let promptFile = root;
    const cwd = process.cwd();

    const existingPromptFile = await getPromptFile();

    let prompt: string;

    if (existingPromptFile) {
      if (!existingPromptFile.startsWith(cwd)) {
        p.log.warn(
          dedent`${color.yellow("a prompt file already exists!")}
                    ${color.gray(existingPromptFile)}`,
        );

        const shouldContinue = await p.confirm({
          message: "do you want to create in the current directory instead?",
          initialValue: true,
        });

        if (p.isCancel(shouldContinue) || !shouldContinue) {
          p.log.error("aborted");
          return await exit(1);
        }

        promptFile = cwd;
      } else {
        p.log.error(
          dedent`${color.red("a prompt file already exists.")}
                    ${color.gray(existingPromptFile)}`,
        );
        return await exit(1);
      }
    }

    if (root !== cwd && !input.root) {
      const shouldUseRoot = await p.confirm({
        message: "do you want to create the prompt file in the git root?",
        initialValue: true,
      });

      if (p.isCancel(shouldUseRoot)) {
        p.log.error("aborted");
        return await exit(1);
      }

      if (!shouldUseRoot) promptFile = cwd;
    }

    // todo: generate prompt based on existing commits

    try {
      const dir = `${promptFile}/.noto`;
      await fs.mkdir(dir, { recursive: true });

      const filePath = `${dir}/commit-prompt.md`;
      await fs.writeFile(filePath, "noto", "utf-8");
    } catch {
      p.log.error(color.red("failed to create the prompt file!"));
    }
  });

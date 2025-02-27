import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";
import clipboard from "clipboardy";

import { withAuth } from "@/middleware/auth";
import { withRepository } from "@/middleware/git";

import { StorageManager } from "@/utils/storage";

import { commit } from "@/utils/git";
import { exit } from "@/utils/process";

import type { Command } from "@/types";

const command: Command = {
  name: "prev",
  description: "access the last generated commit message",
  usage: "noto prev [options]",
  options: [
    {
      type: Boolean,
      flag: "--copy",
      alias: "-c",
      description: "copy the last generated commit message to clipboard",
    },
    {
      type: Boolean,
      flag: "--apply",
      alias: "-a",
      description: "commit the last generated message directly",
    },
  ],
  execute: withAuth(
    withRepository(
      async (options) => {
        const lastGeneratedMessage = (await StorageManager.get())
          .lastGeneratedMessage;

        if (!lastGeneratedMessage) {
          p.log.error(color.red("no previous commit message found"));
          return await exit(1);
        }

        p.log.step(lastGeneratedMessage);

        if (options["--copy"]) {
          clipboard.writeSync(lastGeneratedMessage);
          p.log.step(
            color.dim("copied last generated commit message to clipboard")
          );
        }

        if (options["--apply"]) {
          if (!options.isRepo) {
            p.log.error(
              dedent`${color.red("no git repository found in cwd.")}
              ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`
            );
            return await exit(1);
          }

          if (!options.diff) {
            p.log.error(
              dedent`${color.red("no staged changes found.")}
              ${color.dim(`run ${color.cyan("`git add <file>`")} or ${color.cyan("`git add .`")} to stage changes.`)}`
            );
            return await exit(1);
          }

          const success = await commit(lastGeneratedMessage);
          if (success) {
            p.log.step(color.dim("commit successful"));
          } else {
            p.log.error(color.red("failed to commit changes"));
          }
        }
        console.log();
      },
      { silent: true }
    )
  ),
};

export default command;

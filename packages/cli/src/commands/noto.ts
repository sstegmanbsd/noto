import * as p from "@clack/prompts";
import color from "picocolors";

import clipboard from "clipboardy";

import { withAuth } from "@/middleware/auth";
import { withRepository } from "@/middleware/git";

import { StorageManager } from "@/utils/storage";

import { commit } from "@/utils/git";
import { exit } from "@/utils/process";

import type { Command } from "@/types";

import { generateCommitMessage } from "@/ai";

const command: Command = {
  name: "noto",
  description: "generate commit message",
  usage: "noto [options]",
  options: [
    {
      type: Boolean,
      flag: "--type",
      alias: "-t",
      description: "generate commit message based on type",
    },
    {
      type: Boolean,
      flag: "--copy",
      alias: "-c",
      description: "copy the generated commit message to clipboard",
    },
    {
      type: Boolean,
      flag: "--apply",
      alias: "-a",
      description: "commit the generated message directly",
    },
    {
      type: Boolean,
      flag: "--edit",
      alias: "-e",
      description: "edit the generated commit message",
    },
  ],
  execute: withAuth(
    withRepository(async (options) => {
      const spin = p.spinner();
      try {
        const { diff } = options;

        const isEditMode = options["--edit"];

        if (options["--type"]) {
          const type = await p.select({
            message: "select the type of commit message",
            options: [
              {
                label: "chore",
                value: "chore",
              },
              {
                label: "feat",
                value: "feat",
              },
              {
                label: "fix",
                value: "fix",
              },
              {
                label: "docs",
                value: "docs",
              },
              {
                label: "refactor",
                value: "refactor",
              },
              {
                label: "perf",
                value: "perf",
              },
              {
                label: "test",
                value: "test",
              },
            ],
          });

          if (p.isCancel(type)) {
            p.log.error(color.red("nothing selected!"));
            return await exit(1);
          }

          options.type = type;
        }

        spin.start("generating commit message");

        let message = await generateCommitMessage(diff, options.type);
        spin.stop(isEditMode ? color.white(message) : color.green(message));

        if (isEditMode) {
          const editedMessage = await p.text({
            message: "edit the generated commit message",
            initialValue: message,
            placeholder: message,
          });

          if (p.isCancel(editedMessage)) {
            p.log.error(color.red("nothing changed!"));
            return await exit(1);
          }

          message = editedMessage;
          p.log.step(color.green(message));
        }

        await StorageManager.update((current) => ({
          ...current,
          lastGeneratedMessage: message,
        }));

        if (options["--copy"]) {
          clipboard.writeSync(message);
          p.log.step(color.dim("copied commit message to clipboard"));
        }

        if (options["--apply"]) {
          const success = await commit(message);
          if (success) {
            p.log.step(color.dim("commit successful"));
          } else {
            p.log.error(color.red("failed to commit changes"));
          }
        }

        process.stdout.write("\n");
      } catch {
        spin.stop(color.red("failed to generate commit message"), 1);
        return await exit(1);
      }
    })
  ),
};

export default command;

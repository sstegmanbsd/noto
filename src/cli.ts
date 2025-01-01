import yargs from "yargs";
import prompts from "@posva/prompts";
import c from "picocolors";
import clipboardy from "clipboardy";

import { hideBin } from "yargs/helpers";

import { dump, load } from "@/storage";
import { commit, getStagedDiff, isGitRepository } from "@/git";
import { generateCommitMessage } from "@/ai";

import { spinner } from "@/utils";

import { version } from "../package.json";

import { simpleGit } from "simple-git";

yargs(hideBin(process.argv))
  .scriptName("noto")
  .usage("$0 [args]")
  .command(
    "config",
    "setup you API key to enable noto.",
    () => {},
    async () => {
      const storage = await load();
      if (storage.apiKey) {
        const response = await prompts(
          {
            type: "confirm",
            name: "reset",
            message: "Do you want to reset your API key?",
          },
          {
            onCancel: () => process.exit(0),
          }
        );
        if (!response.reset) {
          console.log(
            `Use ${c.greenBright(
              c.bold("`noto`")
            )} to generate your commit message!`
          );
          process.exit(0);
        }
      }
      const response = await prompts({
        type: "password",
        name: "apiKey",
        message: "Please enter your API key:",
        validate: (value) => (value ? true : "API key is required!"),
      });
      if (response.apiKey) {
        storage.apiKey = response.apiKey;
        await dump();
        console.log("API key configured successfully!");
        console.log(
          `Use ${c.greenBright(
            c.bold("`noto`")
          )} to generate your commit message!`
        );
      }
    }
  )
  .command(
    "prev",
    "access previous commit message",
    (args) => {
      args.option("copy", {
        alias: "c",
        type: "boolean",
        description: "Copy the previous commit message to the clipboard.",
      });
      args.option("apply", {
        alias: "a",
        type: "boolean",
        description: "Commit the staged changes with the previous message.",
      });
    },
    async (args) => {
      const spin = spinner();

      const storage = await load();
      if (!storage.lastGeneratedMessage) {
        console.log(c.red("No previous commit message found."));
        console.log(
          c.dim(
            `Generate a new message with ${c.cyan(c.bold("`noto`"))} command.`
          )
        );
        process.exit(1);
      }

      const message = storage.lastGeneratedMessage;

      spin.success(`Previous Commit Message: ${c.dim(c.bold(message))}`);

      if (args.copy) {
        clipboardy.writeSync(message);
        spin.success("Message copied to clipboard!");
      }

      if (args.apply) {
        if (!(await isGitRepository())) {
          console.log(
            c.red("Oops! No Git repository found in the current directory.")
          );
          console.log(
            c.dim(
              `You can initialize one by running ${c.cyan(
                c.bold("`git init`")
              )}`
            )
          );
          process.exit(1);
        }

        const diff = await getStagedDiff();
        if (!diff) {
          console.log(c.red("Oops! No staged changes found to commit."));
          console.log(
            c.dim(
              `Stage changes with ${c.cyan(
                c.bold("`git add <file>`")
              )} or ${c.cyan(c.bold("`git add .`"))} for stage all files.`
            )
          );
          process.exit(1);
        }

        if (!(await commit(message))) {
          spin.fail("Failed to commit staged changes.");
          process.exit(1);
        }

        spin.success("Staged changes committed successfully!");
      }
    }
  )
  .command(
    "*",
    "generate commit message",
    (args) => {
      args.option("copy", {
        alias: "c",
        type: "boolean",
        description: "Copy the generated commit message to the clipboard.",
      });
      args.option("apply", {
        alias: "a",
        type: "boolean",
        description: "Commit the staged changes with the generated message.",
      });
    },
    async (args) => {
      const storage = await load();
      if (!storage.apiKey) {
        console.log(
          `Please run ${c.cyan(c.bold("`noto config`"))} to set your API key.`
        );
        process.exit(1);
      }

      if (!(await isGitRepository())) {
        console.log(
          c.red("Oops! No Git repository found in the current directory.")
        );
        console.log(
          c.dim(
            `You can initialize one by running ${c.cyan(c.bold("`git init`"))}`
          )
        );
        process.exit(1);
      }

      const diff = await getStagedDiff();
      if (!diff) {
        console.log(c.red("Oops! No staged changes found to commit."));
        console.log(
          c.dim(
            `Stage changes with ${c.cyan(
              c.bold("`git add <file>`")
            )} or ${c.cyan(c.bold("`git add .`"))} for stage all files.`
          )
        );
        process.exit(1);
      }

      const spin = spinner();
      try {
        spin.start("Generating commit message...");
        const message = await generateCommitMessage(diff);

        storage.lastGeneratedMessage = message;
        await dump();

        spin.success(`Commit Message: ${c.dim(c.bold(message))}`);

        if (args.copy) {
          clipboardy.writeSync(message);
          spin.success("Message copied to clipboard!");
        }

        if (args.apply) {
          if (!(await commit(message))) {
            spin.fail("Failed to commit staged changes.");
            process.exit(1);
          }
          spin.success("Staged changes committed successfully!");
        }
      } catch (error) {
        spin.fail("Failed to generate commit message.");
        process.exit(1);
      }
    }
  )
  .version("version", version)
  .alias("-v", "--version")
  .alias("-h", "--help").argv;

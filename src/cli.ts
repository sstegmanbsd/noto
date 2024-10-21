import yargs from "yargs";
import prompts from "@posva/prompts";
import c from "picocolors";

import { hideBin } from "yargs/helpers";

import { dump, load } from "@/storage";
import { getStagedDiff, isGitRepository } from "@/git";
import { generateCommitMessage } from "@/ai";

yargs(hideBin(process.argv))
  .scriptName("noto")
  .usage("$0 [args]")
  .command(
    "config",
    "configure",
    () => {},
    async () => {
      const storage = await load();
      if (storage.apiKey) {
        const response = await prompts({
          type: "confirm",
          name: "reset",
          message: "Do you want to reset your API key?",
        });
        if (!response.reset) {
          console.log(`Use ${c.bold("`noto`")} to generate commit message!`);
          return process.exit(0);
        }
      }
      const response = await prompts({
        type: "password",
        name: "apiKey",
        message: "Enter your API key:",
        validate: (value) => (value ? true : "API key is required"),
      });
      if (response.apiKey) {
        storage.apiKey = response.apiKey;
        dump();
      }
      console.log(`Use ${c.bold("`noto`")} to generate commit message!`);
    }
  )
  .command(
    "*",
    "generate commit message",
    () => {},
    async () => {
      const storage = await load();
      if (!storage.apiKey) {
        console.log(
          `Please run ${c.bold("`noto config`")} to set your API key.`
        );
        process.exit(1);
      }
      const cwd = process.cwd();
      if (!isGitRepository(cwd)) {
        console.log(c.red("hmm! git repository not found"));
        process.exit(1);
      }
      const diff = await getStagedDiff();
      if (!diff) {
        console.log(c.red("hmm! no staged diff found"));
        process.exit(1);
      }
      const message = await generateCommitMessage(diff);
      console.log(c.white(message));
    }
  )
  .version()
  .alias("-v", "--version")
  .alias("-h", "--help").argv;

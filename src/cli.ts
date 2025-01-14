import yargs from "yargs";

import { hideBin } from "yargs/helpers";

import { config } from "commands/config";
import { generate } from "commands/generate";
import { prev } from "commands/prev";

import { version } from "package";

yargs(hideBin(process.argv))
  .scriptName("noto")
  .usage("$0 [args]")
  .command("config", "setup you API key to enable noto.", () => {}, config)
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
    prev
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
    generate
  )
  .version("version", version)
  .alias("-v", "--version")
  .alias("-h", "--help").argv;

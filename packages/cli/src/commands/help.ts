import color from "picocolors";

import { getCommand, listCommand } from "~/commands";
import { exit } from "~/utils/process";

import type { Command } from "~/types";

const help: Command = {
  name: "help",
  description: "show help",
  usage: "noto help [command]",
  execute: async (options) => {
    const command = getCommand(options._[0]);

    if (command && command.name !== "help") {
      console.log();
      console.log(color.bold("usage"));
      console.log(`  ${command.usage}`);
      console.log();
      console.log(color.bold("description"));
      console.log(`  ${command.description}`);
      console.log();
    } else {
      const commands = listCommand();

      console.log();
      console.log(color.bold("usage"));
      console.log(`  noto [command] [options]`);
      console.log();
      console.log(color.bold("commands"));

      commands.forEach((command) => {
        console.log(
          `  ${color.bold(command.name)}   ${color.dim(command.description)}`
        );
      });

      await exit(0);
    }
  },
};

export default help;

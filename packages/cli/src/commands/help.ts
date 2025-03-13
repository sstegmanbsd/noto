import color from "picocolors";

import { getCommand, listCommand } from "@/commands";

import type { Command } from "@/types";

const help: Command = {
  name: "help",
  description: "show help",
  usage: "noto help [command]",
  execute: async (options) => {
    const command = getCommand(options._[0]);

    if (command) {
      console.log();
      console.log(color.bold("Usage"));
      console.log(`  ${command.usage}`);
      console.log();
      console.log(color.bold("Description"));
      console.log(`  ${command.description}`);
      console.log();
    } else {
      const commands = listCommand();

      console.log();
      console.log(color.bold("Usage"));
      console.log(`  noto [command] [options]`);
      console.log();
      console.log(color.bold("Commands"));

      commands.forEach((command) => {
        console.log(
          `  ${color.bold(command.name)}   ${color.dim(command.description)}`
        );
      });

      console.log();
    }
  },
};

export default help;

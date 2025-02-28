import * as p from "@clack/prompts";
import color from "picocolors";

import { parse } from "@/utils/parser";

import { getCommand } from "@/commands";

import { version } from "package";

import type arg from "arg";

const globalSpec = {
  "--version": Boolean,
  "--help": Boolean,

  "-v": "--version",
  "-h": "--help",
};

function main() {
  const args = process.argv.slice(2);

  const { command, options: globalOptions } = parse(globalSpec, args);

  console.log();
  p.intro(`${color.bgCyan(color.black(" @snelusha/noto "))}`);

  if (globalOptions["--version"]) return p.outro(version);

  const cmd = getCommand(command) ?? getCommand("noto");
  if (!cmd) return getCommand("noto")?.execute(globalOptions);

  let commandArgs = args;

  let selectedCommand = cmd;
  if (cmd.subCommands && commandArgs.length) {
    const possibleCommand = commandArgs[1];
    const subCommand = cmd.subCommands.find(
      (cmd) =>
        cmd.name === possibleCommand ||
        (cmd.aliases && cmd.aliases.includes(possibleCommand))
    );
    if (subCommand) {
      selectedCommand = subCommand;
      commandArgs = commandArgs.slice(1);
    }
  }

  const commandSpec = (selectedCommand.options ?? []).reduce((acc, opt) => {
    acc[opt.flag] = opt.type ?? Boolean;
    if (Array.isArray(opt.alias))
      opt.alias.forEach((alias) => (acc[alias] = opt.flag));
    else if (opt.alias) acc[opt.alias] = opt.flag;
    return acc;
  }, {} as arg.Spec);

  const { options: commandOptions } = parse(commandSpec, commandArgs);

  const options = { ...globalOptions, ...commandOptions };

  selectedCommand.execute(options);
}

main();

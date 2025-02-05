import { parse } from "@/utils/parser";

import { getCommand } from "@/commands";

import { version } from "package";

import type arg from "arg";

const spec = {
  "--version": Boolean,
  "--help": Boolean,

  "-v": "--version",
  "-h": "--help",
};

function main() {
  const args = process.argv.slice(2);

  const { command, options: globalOptions } = parse(spec, args);

  if (globalOptions["--version"]) return console.log(version);

  const cmd = getCommand(command) ?? getCommand("noto");
  if (!cmd) return getCommand("noto")?.execute(globalOptions);

  const commandArgs = command ? args.slice(1) : args;

  const commandSpec = (cmd.options ?? []).reduce((acc, opt) => {
    acc[opt.flag] = opt.type ?? Boolean;
    if (Array.isArray(opt.alias))
      opt.alias.forEach((alias) => (acc[alias] = opt.flag));
    else if (opt.alias) acc[opt.alias] = opt.flag;
    return acc;
  }, {} as arg.Spec);

  const { options: commandOptions } = parse(commandSpec, commandArgs);

  const options = { ...globalOptions, ...commandOptions };

  cmd.execute(options);
}

main();

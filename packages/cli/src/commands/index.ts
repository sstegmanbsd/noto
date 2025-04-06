import noto from "@/commands/noto";
import prev from "@/commands/prev";
import checkout from "@/commands/checkout";
import config from "@/commands/config";
import help from "@/commands/help";

import type { Command } from "@/types";

const commands: Command[] = [noto, prev, checkout, config, help];

export const getCommand = (name: string, cmds: Command[] = commands) => {
  return cmds.find((cmd) => cmd.name === name);
};

export const listCommand = () => {
  return commands;
};

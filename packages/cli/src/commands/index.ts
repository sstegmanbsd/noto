import noto from "@/commands/noto";
import config from "@/commands/config";

import type { Command } from "@/types";

const commands: Command[] = [noto, config];

export const getCommand = (name: string, cmds: Command[] = commands) => {
  return cmds.find((cmd) => cmd.name === name);
};

export const listCommand = () => {
  return commands;
};

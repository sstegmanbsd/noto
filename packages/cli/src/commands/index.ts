import noto from "@/commands/noto";

import type { Command } from "@/types";

const commands: Command[] = [noto];

export function getCommand(name: string) {
  return commands.find((cmd) => cmd.name === name);
}

export function listCommands() {
  return commands;
}

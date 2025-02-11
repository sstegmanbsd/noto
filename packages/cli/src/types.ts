import type arg from "arg";

export interface CommandOption {
  type?: BooleanConstructor | StringConstructor | NumberConstructor;
  flag: string;
  alias?: string | string[];
  description: string;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  options?: CommandOption[];
  aliases?: string[];
  subCommands?: Command[];
  execute: (args: arg.Result<arg.Spec>) => void;
}

import type { Command } from "@/types";

const command: Command = {
  name: "noto",
  description: "generate commit message",
  usage: "noto [options]",
  options: [],
  execute: (options) => {
    console.log("noto", options);
  },
};

export default command;

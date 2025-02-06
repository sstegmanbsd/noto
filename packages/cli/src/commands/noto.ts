import * as p from "@clack/prompts";

import type { Command } from "@/types";

const command: Command = {
  name: "noto",
  description: "generate commit message",
  usage: "noto [options]",
  options: [],
  execute: (options) => {
    p.outro("No more overthinking, Just commit in seconds!");
  },
};

export default command;

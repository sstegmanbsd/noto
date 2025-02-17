import * as p from "@clack/prompts";

import type { Command } from "@/types";

import { withAuth } from "@/middleware/auth";
import { withRepository } from "@/middleware/git";

const command: Command = {
  name: "noto",
  description: "generate commit message",
  usage: "noto [options]",
  options: [],
  execute: withAuth(
    withRepository(async (options) => {
      p.outro("No more overthinking, Just commit in seconds!");
    })
  ),
};

export default command;

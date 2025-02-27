import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { StorageManager } from "@/utils/storage";
import { exit } from "@/utils/process";

import type { Command } from "@/types";

interface WithAuthOptions {
  silent?: boolean;
}

export const withAuth = (
  fn: Command["execute"],
  options: WithAuthOptions = {}
): Command["execute"] => {
  return async (opts) => {
    const storage = await StorageManager.get();
    if (!storage.llm?.apiKey && !options.silent) {
      p.log.error(
        dedent`${color.red("noto api key is missing.")}
        ${color.dim(`run ${color.cyan("`noto config key`")} to set it up.`)}`
      );
      return await exit(1);
    }
    return fn(opts);
  };
};

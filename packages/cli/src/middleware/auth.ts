import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { StorageManager } from "@/utils/storage";

import type { Command } from "@/types";

export const withAuth = (fn: Command["execute"]): Command["execute"] => {
  return async (options) => {
    const storage = await StorageManager.get();
    if (!storage.llm?.apiKey) {
      p.log.error(
        dedent`${color.red("noto api key is missing.")}
        ${color.dim(`run ${color.cyan("`noto config key`")} to set it up.`)}`
      );
      console.log();
      process.exit(1);
    }
    return fn(options);
  };
};

import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { StorageManager } from "@/utils/storage";
import { exit } from "@/utils/process";

import type { Command } from "@/types";

interface WithAuthOptions {
  enabled?: boolean;
}

export const withAuth = (
  fn: Command["execute"],
  options: WithAuthOptions = { enabled: true }
): Command["execute"] => {
  return async (opts) => {
    const storage = await StorageManager.get();

    const apiKey = process.env.NOTO_API_KEY || storage.llm?.apiKey;

    if (!apiKey && options.enabled) {
      p.log.error(
        dedent`${color.red("noto api key is missing.")}
        ${color.dim(`run ${color.cyan("`noto config key`")} to set it up.`)}`
      );
      return await exit(1);
    }
    return fn(opts);
  };
};

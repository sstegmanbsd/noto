import { join } from "node:path";
import { existsSync } from "node:fs";

import { x } from "tinyexec";

export function isGitRepository(path: string) {
  return existsSync(join(path, ".git"));
}

export async function getStagedDiff(): Promise<string | null> {
  try {
    const fullDiff = (await x("git", ["diff", "--cached"])).stdout.toString();
    return fullDiff;
  } catch {
    return null;
  }
}

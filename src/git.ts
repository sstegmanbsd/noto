import { join } from "node:path";
import { existsSync } from "node:fs";

import { x } from "tinyexec";

export function isGitRepository(path: string) {
  return existsSync(join(path, ".git"));
}

export async function getStagedDiff(): Promise<string | null> {
  try {
    const diff = (await x("git", ["diff", "--cached"])).stdout.toString();
    return diff;
  } catch {
    return null;
  }
}

export async function commit(message: string): Promise<boolean> {
  try {
    const result = await x("git", ["commit", "-m", message]);
    return result.stdout.includes("files changed")
  } catch {
    return false;
  }
}

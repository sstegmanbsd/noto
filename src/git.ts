import simpleGit from "simple-git";

export async function isGitRepository() {
  try {
    return await simpleGit().checkIsRepo();
  } catch {
    return false;
  }
}

export async function getStagedDiff(): Promise<string | null> {
  try {
    return await simpleGit().diff(["--cached"]);
  } catch {
    return null;
  }
}

export async function commit(message: string): Promise<boolean> {
  try {
    const result = await simpleGit().commit(message);
    return result.summary.changes > 0;
  } catch {
    return false;
  }
}

export async function getCommitCount() {
  try {
    const count = await simpleGit().raw(["rev-list", "--count", "HEAD"]);
    return Number(count.trim());
  } catch (error) {
    if (
      /(ambiguous argument.*HEAD|unknown revision or path.*HEAD)/i.test(
        (error as Error).message
      )
    ) {
      return 0;
    }
    return null;
  }
}

export async function isFirstCommit() {
  try {
    const count = await getCommitCount();
    return count === 0;
  } catch {
    return false;
  }
}

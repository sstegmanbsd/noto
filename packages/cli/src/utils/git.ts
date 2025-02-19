import simpleGit from "simple-git";

export const git = simpleGit();

export const isGitRepository = async () => {
  return git.checkIsRepo();
};

export const getCommitCount = async () => {
  try {
    const count = await git.raw(["rev-list", "--all", "--count"]);
    return parseInt(count);
  } catch (error) {
    const message = (error as Error).message;
    const regex = /(ambiguous argument.*HEAD|unknown revision or path.*HEAD)/;

    if (regex.test(message)) return 0;
    return null;
  }
};

export const isFirstCommit = async () => {
  const count = await getCommitCount();
  return count === 0;
};

export const getBranch = async () => {
  try {
    return git.raw(["rev-parse", "--abbrev-ref", "HEAD"]);
  } catch {
    return null;
  }
};

export const getStagedFiles = async () => {
  try {
    const stagedFiles = (await git.diff(["--cached", "--name-only"]))
      .split("\n")
      .filter(Boolean);
    return stagedFiles;
  } catch {
    return null;
  }
};

export const getStagedDiff = async () => {
  try {
    return git.diff(["--cached"]);
  } catch {
    return null;
  }
};

export const commit = async (message: string) => {
  try {
    const {
      summary: { changes },
    } = await git.commit(message);
    return Boolean(changes);
  } catch {
    return false;
  }
};

export const push = async () => {
  try {
    const { pushed } = await git.push();
    return Boolean(pushed.length);
  } catch {
    return false;
  }
};

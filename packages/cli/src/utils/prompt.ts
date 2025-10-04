import { getGitRoot } from "~/utils/git";
import { findUp } from "~/utils/fs";

export const getPromptFile = async () => {
  const root = await getGitRoot();
  return await findUp(".noto/commit-prompt.md", {
    stopAt: root || process.cwd(),
    type: "file",
  });
};

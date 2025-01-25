import pc from "picocolors";
import clipboardy from "clipboardy";

import { load } from "@/storage";
import { commit } from "@/git";

import {
  ensureApiKey,
  ensureGitRepository,
  ensureStagedChanges,
  spinner,
} from "@/utils";

import type { ArgumentsCamelCase } from "yargs";

export async function prev(args: ArgumentsCamelCase) {
  const storage = await load();

  if (!storage.lastGeneratedMessage) {
    console.log(pc.red("No previous commit message found."));
    console.log(
      pc.dim(`Generate a new message with ${pc.cyan(pc.bold("`noto`"))} command.`)
    );
    process.exit(1);
  }
  const spin = spinner();

  const message = storage.lastGeneratedMessage;

  spin.success(`Previous Commit Message: ${pc.dim(pc.bold(message))}`);

  if (args.copy) {
    clipboardy.writeSync(message);
    spin.success("Message copied to clipboard!");
  }

  if (args.apply) {
    await ensureGitRepository();

    await ensureStagedChanges();

    if (!(await commit(message))) {
      spin.fail("Failed to commit staged changes.");
      process.exit(1);
    }

    spin.success("Staged changes committed!");
  }
}

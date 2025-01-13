import c from "picocolors";
import clipboardy from "clipboardy";

import { load, dump } from "@/storage";
import { commit } from "@/git";
import { generateCommitMessage } from "@/ai";
import {
  ensureApiKey,
  ensureGitRepository,
  ensureStagedChanges,
  spinner,
} from "@/utils";

import type { ArgumentsCamelCase } from "yargs";

export async function generate(args: ArgumentsCamelCase) {
  const storage = await load();

  await ensureApiKey();
  await ensureGitRepository();

  const diff = await ensureStagedChanges();

  const spin = spinner();

  try {
    spin.start("Generating commit message...");

    const message = await generateCommitMessage(diff);

    storage.lastGeneratedMessage = message;
    await dump();

    spin.success(`Commit Message: ${c.dim(c.bold(message))}`);

    if (args.copy) {
      clipboardy.writeSync(message);
      spin.success("Message copied to clipboard!");
    }

    if (args.apply) {
      await commit(message);
      spin.success("Staged changes committed!");
    }
  } catch (_) {
    spin.fail("Failed to generate commit message.");
    process.exit(1);
  }
}

import os from "node:os";
import process from "node:process";

import which from "which";
import ora from "ora";
import pc from "picocolors";

import { dirname, join } from "node:path";
import { existsSync, promises as fs } from "node:fs";

import type { Buffer } from "node:buffer";

import type { Ora } from "ora";

import { load } from "@/storage";
import { getStagedDiff, isGitRepository } from "@/git";

export const APP_DIR = join(os.homedir(), "snelusha-noto");

export function remove<T>(arr: T[], v: T) {
  const index = arr.indexOf(v);
  if (index >= 0) arr.splice(index, 1);
  return arr;
}

export function exclude<T>(arr: T[], ...v: T[]) {
  return arr.slice().filter((item) => !v.includes(item));
}

export function cmdExists(cmd: string) {
  return which.sync(cmd, { nothrow: true }) !== null;
}

interface TempFile {
  path: string;
  fd: fs.FileHandle;
  cleanup: () => void;
}

let counter = 0;

async function openTemp(): Promise<TempFile | undefined> {
  if (!existsSync(APP_DIR)) await fs.mkdir(APP_DIR, { recursive: true });

  const competitivePath = join(APP_DIR, `.${process.pid}.${counter}`);
  counter += 1;

  return fs
    .open(competitivePath, "wx")
    .then((fd) => ({
      fd,
      path: competitivePath,
      cleanup() {
        fd.close().then(() => {
          if (existsSync(competitivePath)) fs.unlink(competitivePath);
        });
      },
    }))
    .catch((error: any) => {
      if (error && error.code === "EEXIST") return openTemp();
      else return undefined;
    });
}

export async function writeFileSafe(
  path: string,
  data: string | Buffer = ""
): Promise<boolean> {
  const temp = await openTemp();

  if (temp) {
    try {
      // @ts-expect-error eslint-disable-next-line
      await fs.writeFile(temp.path, data);
      const directory = dirname(path);
      if (!existsSync(directory))
        await fs.mkdir(directory, { recursive: true });
      await fs.rename(temp.path, path);
      return true;
    } catch {
      return false;
    } finally {
      temp.cleanup();
    }
  }

  return false;
}

export function spinner() {
  let s: Ora | undefined;

  return {
    start(text: string) {
      s = ora(text);
      s.spinner = {
        interval: 150,
        frames: ["✶", "✸", "✹", "✺", "✹", "✷"],
      };
      s.start();
    },
    fail(text: string) {
      if (!s) {
        s = ora();
      }
      s.fail(text);
      s = undefined;
    },
    success(text: string) {
      if (!s) {
        s = ora();
      }
      s.succeed(text);
      s = undefined;
    },
    stop() {
      if (s) {
        s.stop();
        s = undefined;
      }
    },
  };
}

export async function ensureApiKey() {
  const storage = await load();
  if (!storage.apiKey) {
    console.log(
      `Please run ${pc.cyan(pc.bold("`noto config`"))} to set your API key.`
    );
    process.exit(1);
  }
}

export async function ensureGitRepository() {
  if (await isGitRepository()) return;
  console.log(pc.red("Oops! No Git repository found in the current directory."));
  console.log(
    pc.dim(`You can initialize one by running ${pc.cyan(pc.bold("`git init`"))}`)
  );
  process.exit(1);
}

export async function ensureStagedChanges() {
  const diff = await getStagedDiff();
  if (diff) return diff;
  console.log(pc.red("Oops! No staged changes found to commit."));
  console.log(
    pc.dim(
      `Stage changes with ${pc.cyan(pc.bold("`git add <file>`"))} or ${pc.cyan(
        pc.bold("`git add .`")
      )} for stage all files.`
    )
  );
  process.exit(1);
}

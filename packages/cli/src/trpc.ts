import { trpcServer } from "trpc-cli";

import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { getStagedDiff, isGitRepository } from "~/utils/git";
import { StorageManager } from "~/utils/storage";
import { exit } from "~/utils/process";

import type { TrpcCliMeta } from "trpc-cli";

export type Meta = TrpcCliMeta & {
  authRequired?: boolean;
  repoRequired?: boolean;
  diffRequired?: boolean;
};

export const t = trpcServer.initTRPC.meta<Meta>().create({
  defaultMeta: {
    authRequired: true,
    repoRequired: true,
    diffRequired: false,
  },
});

export const baseProcedure = t.procedure;

export const authProcedure = baseProcedure.use(async (opts) => {
  const { meta, next } = opts;

  const storage = await StorageManager.get();
  const apiKey = process.env.NOTO_API_KEY || storage.llm?.apiKey;

  if (meta?.authRequired && !apiKey) {
    p.log.error(
      dedent`${color.red("noto api key is missing.")}
        ${color.dim(`run ${color.cyan("`noto config key`")} to set it up.`)}`,
    );
    return await exit(1);
  }

  return next();
});

export const gitProcedure = baseProcedure.use(async (opts) => {
  const { meta, next } = opts;

  const isRepository = await isGitRepository();
  if (meta?.repoRequired && !isRepository) {
    p.log.error(
      dedent`${color.red("no git repository found in cwd.")}
          ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`,
    );
    return await exit(1);
  }

  const diff = isRepository && (await getStagedDiff());
  if (meta?.diffRequired && !diff) {
    p.log.error(
      dedent`${color.red("no staged changes found.")}
          ${color.dim(`stage your changes with ${color.cyan("`git add <file>`")}`)}`,
    );
    return await exit(1);
  }

  return next({
    ctx: {
      git: {
        isRepository,
        diff,
      },
    },
  });
});

export const authedGitProcedure = authProcedure.concat(gitProcedure);

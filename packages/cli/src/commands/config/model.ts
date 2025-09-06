import * as p from "@clack/prompts";
import color from "picocolors";

import { baseProcedure } from "~/trpc";

import { models } from "~/ai/models";

import { StorageManager } from "~/utils/storage";
import { exit } from "~/utils/process";

import type { AvailableModels } from "~/ai/types";

export const model = baseProcedure
  .meta({
    description: "configure model",
  })
  .mutation(async () => {
    const model = await p.select({
      message: "select a model",
      initialValue: (await StorageManager.get()).llm?.model,
      options: Object.keys(models).map((model) => ({
        label: model,
        value: model,
      })),
    });

    if (p.isCancel(model)) {
      p.log.error(color.red("nothing changed!"));
      return await exit(1);
    }

    if (model === "gemini-2.5-pro-preview-05-06") {
      const confirm = await p.confirm({
        message:
          "this model does not have free quota tier, do you want to continue?",
      });

      if (p.isCancel(confirm) || !confirm) {
        p.log.error(color.red("nothing changed!"));
        return await exit(1);
      }
    }

    await StorageManager.update((current) => ({
      ...current,
      llm: {
        ...current.llm,
        model: model as AvailableModels,
      },
    }));

    p.log.success(color.green("model configured!"));

    await exit(0);
  });

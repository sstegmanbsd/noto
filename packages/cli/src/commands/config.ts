import * as p from "@clack/prompts";
import color from "picocolors";

import { getCommand } from "@/commands";

import { models } from "@/ai/models";

import { StorageManager } from "@/utils/storage";
import { exit } from "@/utils/process";

import type { Command } from "@/types";
import type { AvailableModels } from "@/ai/types";

const key: Command = {
  name: "key",
  description: "configure api key",
  usage: "noto config key [options]",
  execute: async (options) => {
    if ((await StorageManager.get()).llm?.apiKey) {
      const confirm = await p.confirm({
        message: "noto api key already configured, do you want to update it?",
      });

      if (p.isCancel(confirm) || !confirm) {
        p.log.error(color.red("nothing changed!"));
        return await exit(1);
      }
    }

    let apiKey = options._[0];

    if (!apiKey) {
      const result = await p.text({
        message: "enter your noto api key",
      });

      if (p.isCancel(result)) {
        p.log.error(color.red("nothing changed!"));
        return await exit(1);
      }

      apiKey = result as string;
    }

    await StorageManager.update((current) => ({
      ...current,
      llm: {
        ...current.llm,
        apiKey,
      },
    }));

    p.log.success(color.green("noto api key configured!"));

    await exit(0);
  },
};

const model: Command = {
  name: "model",
  description: "configure model",
  usage: "noto config model [options]",
  execute: async () => {
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
  },
};

const reset: Command = {
  name: "reset",
  description: "reset configuration",
  usage: "noto config reset",
  execute: async () => {
    const confirm = await p.confirm({
      message: "are you sure you want to reset the configuration?",
    });

    if (p.isCancel(confirm) || !confirm) {
      p.log.error(color.red("nothing changed!"));
      return await exit(1);
    }

    await StorageManager.clear();

    p.log.success(color.green("configuration reset!"));

    await exit(0);
  },
};

const subCommands = [key, model, reset];

const command: Command = {
  name: "config",
  description: "configure noto",
  usage: "noto config [subcommand]",
  execute: async (options) => {
    const command = await p.select({
      message: "select a subcommand",
      options: subCommands.map((cmd) => ({
        label: cmd.description,
        value: cmd.name,
      })),
    });
    if (p.isCancel(command)) {
      return await exit(1);
    }

    const cmd = getCommand(command, subCommands);
    if (!cmd) {
      p.log.error(color.red("unknown config command"));
      return await exit(1);
    }

    options._ = options._.slice(1);
    cmd.execute(options);
  },
  subCommands: subCommands,
};

export default command;

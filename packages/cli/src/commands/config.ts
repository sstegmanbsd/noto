import * as p from "@clack/prompts";

import { getCommand } from "@/commands";

import { StorageManager } from "@/utils/storage";

import type { Command } from "@/types";

export const models = [
  "gemini-2.0-pro-exp-02-05",
  "gemini-2.0-flash",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro",
  "gemini-1.5-flash-latest",
  "gemini-2.0-flash-exp-02-05",
];

const key: Command = {
  name: "key",
  description: "configure api key",
  usage: "noto config key [options]",
  execute: async (options) => {
    if ((await StorageManager.get()).llm?.apiKey) {
      const confirm = await p.confirm({
        message: "api key already configured, do you want to update it?",
      });

      if (!confirm) return p.outro("api key not configured");
    }

    let apiKey = options._[0];

    if (!apiKey) {
      const result = await p.text({
        message: "enter your api key",
      });

      if (p.isCancel(result))
        return p.outro("cancelled! api key not configured");

      apiKey = result as string;
    }

    await StorageManager.update((current) => ({
      ...current,
      llm: {
        ...current.llm,
        apiKey,
      },
    }));

    p.outro("noto api key configured");
  },
};

const model: Command = {
  name: "model",
  description: "configure model",
  usage: "noto config model [options]",
  execute: async (options) => {
    const model = await p.select({
      message: "select a model",
      options: models.map((model) => ({ label: model, value: model })),
    });
    if (p.isCancel(model)) return p.outro("cancelled");
    p.outro("model configured");
  },
};

const subCommands = [key, model];

const command: Command = {
  name: "config",
  description: "configure noto",
  usage: "noto config [subcommand]",
  execute: async (options) => {
    const command = await p.select({
      message: "Select a subcommand",
      options: subCommands.map((cmd) => ({
        label: cmd.description,
        value: cmd.name,
      })),
    });
    if (p.isCancel(command)) return p.outro("cancelled");

    const cmd = getCommand(command, subCommands);
    if (!cmd) return p.outro("unknown config command");

    options._ = options._.slice(1);
    cmd.execute(options);
  },
  subCommands: subCommands,
};

export default command;

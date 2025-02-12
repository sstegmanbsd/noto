import os from "os";
import { dirname, join, resolve } from "path";
import { promises as fs } from "fs";

import { z } from "zod";

const StorageSchema = z.object({
  llm: z
    .object({
      apiKey: z.string().optional(),
    })
    .optional(),
});

export type Storage = z.infer<typeof StorageSchema>;

export class StorageManager {
  private readonly storagePath: string;

  private storage: Storage = {};

  constructor(storageFileName: string = "storage.sithi") {
    this.storagePath = resolve(join(os.homedir(), ".noto"), storageFileName);
  }

  public async load(): Promise<Storage> {
    try {
      await fs.access(this.storagePath);

      const data = await fs.readFile(this.storagePath, "utf-8");
      const json = data ? JSON.parse(data) : {};

      const result = StorageSchema.safeParse(json);
      if (!result.success) this.storage = {};
      else this.storage = result.data;
    } catch {
      this.storage = {};
    }
    return this.storage;
  }

  public async save(): Promise<void> {
    try {
      const directory = dirname(this.storagePath);
      await fs.mkdir(directory, { recursive: true });

      const data = JSON.stringify(this.storage, null, 2);
      await fs.writeFile(this.storagePath, data, "utf-8");
    } catch {}
  }

  public async update(
    updater: (current: Storage) => Storage | Promise<Storage>
  ): Promise<Storage> {
    try {
      const updatedStorage = await updater(this.storage);

      const result = StorageSchema.safeParse(updatedStorage);
      if (!result.success) return this.storage;

      this.storage = result.data;
      await this.save();
    } catch {}
    return this.storage;
  }

  public get(): Storage {
    return JSON.parse(JSON.stringify(this.storage));
  }
}

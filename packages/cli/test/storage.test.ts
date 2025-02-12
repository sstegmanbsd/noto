import os from "os";
import path from "path";
import { promises as fs } from "fs";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { StorageManager } from "../src/utils/storage";

const storageFileName = "storage.test.sithi";
const tempDir = path.resolve(os.tmpdir(), ".noto");

describe("StorageManager", () => {
  let storageManager: StorageManager;

  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  beforeEach(() => {
    storageManager = new StorageManager(storageFileName);
    (storageManager as any).storagePath = path.resolve(
      tempDir,
      storageFileName
    );
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("load() returns empty storage if file does not exist", async () => {
    const storage = await storageManager.load();
    expect(storage).toEqual({});
  });

  it("save() writes storage to file and load() reads it back", async () => {
    const storage = { llm: { apiKey: "noto-api-key" } };
    await storageManager.update(() => storage);

    const newManager = new StorageManager(storageFileName);
    (newManager as any).storagePath = path.resolve(tempDir, storageFileName);
    const newStorage = await newManager.load();

    expect(newStorage).toEqual({ llm: { apiKey: "noto-api-key" } });
  });

  it("get() returns a shallow copy of the storage", async () => {
    await storageManager.update((current) => ({
      ...current,
      llm: { apiKey: "noto-api-key-updated" },
    }));

    const storageCopy = storageManager.get();
    expect(storageCopy).toEqual({ llm: { apiKey: "noto-api-key-updated" } });

    if (storageCopy.llm) storageCopy.llm.apiKey = "noto-api-key-modified";

    const internalStorage = storageManager.get();
    expect(internalStorage).toEqual({ llm: { apiKey: "noto-api-key-updated" } });
  });
});

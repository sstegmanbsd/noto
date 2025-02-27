import path from "path";

import { exec } from "tinyexec";

import { expect, it } from "vitest";

it("noto should just work", async () => {
  const binPath = path.resolve(__dirname, "../bin/noto.mjs");
  const proc = await exec(process.execPath, [binPath], { throwOnError: false });
  expect(proc.stderr).toBe("");
});

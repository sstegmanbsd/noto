import path from "path";

import { exec } from "tinyexec";

import { expect, it } from "vitest";

it("vars cli should just work", async () => {
  const binPath = path.resolve(__dirname, "../bin/noto.mjs");
  const proc = await exec(process.execPath, [binPath], { throwOnError: true });
  expect(proc.stderr).toBe("");
});

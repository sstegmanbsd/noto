import { t } from "~/trpc";

import { key } from "~/commands/config/key";
import { model } from "~/commands/config/model";
import { reset } from "~/commands/config/reset";

export const config = t.router({
  key,
  model,
  reset,
});

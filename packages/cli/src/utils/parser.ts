import arg from "arg";

export const parse = (schema: arg.Spec, raw: string[]) => {
  const args = arg(schema, { argv: raw, permissive: true });
  return {
    command: args._[0],
    options: args,
  };
};

export const safeParse = (schema: arg.Spec, raw: string[]) => {
  let current = { ...schema };

  let iterations = 0;
  const maxIterations = Object.keys(current).filter(
    (key) => current[key] === String
  ).length;

  while (iterations++ < maxIterations) {
    try {
      return parse(current, raw);
    } catch (error: any) {
      if (error.code === "ARG_MISSING_REQUIRED_LONGARG") {
        const match = error.message.match(/(--\w[\w-]*)/);
        if (match) {
          const missingFlag = match[0];
          if (current[missingFlag] === String) {
            current[missingFlag] = Boolean;
            continue;
          }
        }
      }
      throw error;
    }
  }

  return parse(current, raw);
};

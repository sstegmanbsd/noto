import arg from "arg";

export function parse(schema: arg.Spec, raw: string[]) {
  const args = arg(schema, { argv: raw, permissive: true });
  return {
    command: args._[0],
    options: args,
  };
}

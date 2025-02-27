export const exit = async (code?: number) => {
  await new Promise((resolve) => setTimeout(resolve, 1));
  console.log();
  process.exit(code);
};

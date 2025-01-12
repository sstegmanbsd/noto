import prompts from "@posva/prompts";
import c from "picocolors";

import { load, dump } from "@/storage";

export async function config() {
  const storage = await load();

  if (storage.apiKey) {
    const response = await prompts(
      {
        type: "confirm",
        name: "reset",
        message: "Do you want to reset your API key?",
      },
      {
        onCancel: () => process.exit(0),
      }
    );

    if (!response.reset) {
      console.log(
        `Use ${c.greenBright(
          c.bold("`noto`")
        )} to generate your commit message!`
      );
      process.exit(0);
    }
  }

  const response = await prompts({
    type: "password",
    name: "apiKey",
    message: "Please enter your API key:",
    validate: (value) => (value ? true : "API key is required!"),
  });
  if (response.apiKey) {
    storage.apiKey = response.apiKey;
    await dump();
    console.log("API key configured successfully!");
    console.log(
      `Use ${c.greenBright(c.bold("`noto`"))} to generate your commit message!`
    );
  }
}

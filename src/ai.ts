import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { load } from "@/storage";

export async function generateCommitMessage(diff: string): Promise<string> {
  const storage = await load();
  const google = createGoogleGenerativeAI({
    apiKey: storage.apiKey,
  });
  const message = await generateText({
    model: google("gemini-1.5-flash-latest"),
    messages: [
      {
        role: "system",
        content:
          "You are tasked with generating a Git commit message based on the following staged changes across multiple files. Identify only the key changes and generate a concise commit message in the format: <type>: <description>. The commit message must be a single line, in all lowercase, without a scope or body, and no full stops at the end. Use one of these types: feat, fix, refactor, docs, test, or chore. Do not mention file names unless a file was renamed or is essential to understanding the change. Focus on the most important change, and the message must not exceed 72 characters.",
      },
      {
        role: "user",
        content: `generated commit message for the following staged changes:\n${diff}`,
      },
    ],
  });

  return message.text.trim();
}

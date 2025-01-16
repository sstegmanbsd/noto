import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import dedent from "dedent";

import { z } from "zod";

import { load } from "@/storage";
import { isFirstCommit } from "@/git";

export async function generateCommitMessage(diff: string): Promise<string> {
  if (await isFirstCommit()) return "chore: init repo";

  const storage = await load();

  const google = createGoogleGenerativeAI({
    apiKey: storage.apiKey,
  });

  const { object } = await generateObject({
    model: google("gemini-2.0-flash-exp", {
      structuredOutputs: false,
    }),
    schema: z.object({
      message: z.string(),
    }),
    messages: [
      {
        role: "system",
        content: dedent`
        You are a state-of-the-art AI model tasked with generating a precise Git commit message based on staged changes.
        Adhere strictly to the following instructions, ranked by priority:
    
        1. Write the commit message in present tense, starting with a present-tense verb such as add, fix, update, remove, improve, or implement. This applies to all repositories, including Java.
        2. Summarize the key changes only, crafting a concise and clear commit message in the format "<type>: <description>".
        3. Use one of the following standardized types: feat, fix, refactor, docs, test, or chore.
        4. Ensure the commit message is a single line, fully lowercase, with no scope or body, and omit punctuation such as full stops at the end.
        5. Limit the length of the commit message to 72 characters.
        6. Avoid mentioning file names unless a file was renamed or is critical for understanding the changes.
        7. Prioritize clarity and focus on the most impactful changes for the commit.
    
        You are expected to generate structured outputs that align with the provided guidelines and produce a message optimized for readability and accuracy. Strictly follow all constraints to ensure high-quality results.`,
      },
      {
        role: "user",
        content: dedent`generate a commit message for the following staged changes:\n${diff}`,
      },
    ],
  });

  return object.message.trim();
}

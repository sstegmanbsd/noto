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
        content: `You are tasked with generating a Git commit message for the following staged changes across multiple files. Strictly follow the instructions given below to generate the commit message. The instructions are given according to order of importance, as such, make sure each instruction is followed before moving on to the next. Likewise, make sure all instructions are followed successfully.
          - Ensure the description is written in the present-tense(start with a present tense verb such as add, fix, update, remove, improve, implement, etc...) (IMPORTANT! follow this for java repositories as well).
          - Identify the key changes only and generate a detailed but brief commit message in the format "<type>: <description>".
          - Use one of these types: feat, fix, refactor, docs, test, or chore.
          - The commit message must be a single line, in all lowercase, without a scope or body, and no full stops at the end.
          - Ensure the message does not exceed 72 characters.
          - Do not mention file names unless a file was renamed or is essential for understanding the changes.
          - Focus on the most important changes.`,
      },
      {
        role: "user",
        content: `generated commit message for the following staged changes:\n${diff}`,
      },
    ],
  });

  return message.text.trim();
}

import { z } from "zod";

export const AvailableModelsSchema = z.enum([
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-8b-latest",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-2.0-flash-001",
  "gemini-2.5-pro-exp-03-25",
]);

export type AvailableModels = z.infer<typeof AvailableModelsSchema>;

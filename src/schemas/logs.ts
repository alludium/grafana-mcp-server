import { z } from "zod";

export const SearchLogsSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe('LogQL query string (e.g., \'{app="web"} |= "error"\')'),
  hours: z
    .number()
    .positive()
    .optional()
    .default(1)
    .describe("Hours to search back from now (default: 1)"),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .default(100)
    .describe("Maximum number of log lines to return (default: 100)"),
  response_format: z
    .enum(["json", "markdown"])
    .optional()
    .default("markdown")
    .describe("Response format (default: markdown)"),
});

export type SearchLogsInput = z.infer<typeof SearchLogsSchema>;

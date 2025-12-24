import { getClient } from "../client.js";
import { formatError } from "../utils/error.js";
import { formatLogsMarkdown, formatLogsJson } from "../utils/format.js";
import type { SearchLogsInput } from "../schemas/logs.js";

export async function executeSearchLogs(input: SearchLogsInput): Promise<string> {
  try {
    const client = getClient();

    // Calculate time range (Loki uses nanosecond timestamps)
    const endMs = Date.now();
    const startMs = endMs - input.hours * 3600 * 1000;

    // Convert to nanoseconds
    const end = endMs * 1000000;
    const start = startMs * 1000000;

    // Query Loki
    const response = await client.queryRange({
      query: input.query,
      start,
      end,
      limit: input.limit,
    });

    // Format response
    if (input.response_format === "markdown") {
      return formatLogsMarkdown(response);
    }

    return JSON.stringify(formatLogsJson(response), null, 2);
  } catch (error) {
    return formatError(error);
  }
}

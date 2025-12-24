interface LogEntry {
  timestamp: string;
  line: string;
  labels?: Record<string, string>;
}

interface LogResult {
  data: {
    result: Array<{
      stream: Record<string, string>;
      values: Array<[string, string]>; // [timestamp_ns, log_line]
    }>;
  };
}

export function formatLogsMarkdown(response: LogResult): string {
  const entries: LogEntry[] = [];

  // Parse Loki response format
  if (response.data?.result) {
    for (const stream of response.data.result) {
      for (const [timestampNs, line] of stream.values) {
        // Convert nanosecond timestamp to readable format
        const timestamp = new Date(parseInt(timestampNs) / 1000000).toISOString();
        entries.push({
          timestamp,
          line,
          labels: stream.stream,
        });
      }
    }
  }

  if (entries.length === 0) {
    return "No log entries found matching the query.";
  }

  // Sort by timestamp (most recent first)
  entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  let markdown = `# Log Search Results\n\n`;
  markdown += `Found ${entries.length} log entries\n\n`;
  markdown += `---\n\n`;

  for (const entry of entries) {
    markdown += `**${entry.timestamp}**\n`;

    // Show labels if present
    if (entry.labels && Object.keys(entry.labels).length > 0) {
      const labelStr = Object.entries(entry.labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(", ");
      markdown += `*Labels:* ${labelStr}\n`;
    }

    markdown += `\`\`\`\n${entry.line}\n\`\`\`\n\n`;
  }

  return markdown;
}

export function formatLogsJson(response: LogResult): object {
  const entries: LogEntry[] = [];

  if (response.data?.result) {
    for (const stream of response.data.result) {
      for (const [timestampNs, line] of stream.values) {
        const timestamp = new Date(parseInt(timestampNs) / 1000000).toISOString();
        entries.push({
          timestamp,
          line,
          labels: stream.stream,
        });
      }
    }
  }

  // Sort by timestamp (most recent first)
  entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return {
    total: entries.length,
    entries,
  };
}

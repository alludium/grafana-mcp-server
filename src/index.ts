#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { SearchLogsSchema } from "./schemas/logs.js";
import { executeSearchLogs } from "./tools/logs.js";

function createServer() {
  const server = new Server(
    {
      name: "grafana-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tools/list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "search_logs",
          description:
            "Search Grafana Loki logs using LogQL query language. Returns log entries matching the query within the specified time range.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: 'LogQL query string (e.g., \'{app="web"} |= "error"\')',
              },
              hours: {
                type: "number",
                description: "Hours to search back from now (default: 1)",
                default: 1,
              },
              limit: {
                type: "number",
                description: "Maximum number of log lines to return (default: 100)",
                default: 100,
              },
              response_format: {
                type: "string",
                enum: ["json", "markdown"],
                description: "Response format (default: markdown)",
                default: "markdown",
              },
            },
            required: ["query"],
          },
        },
      ],
    };
  });

  // Register tools/call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "search_logs") {
      try {
        const input = SearchLogsSchema.parse(args);
        const result = await executeSearchLogs(input);

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error parsing arguments: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}

async function main() {
  // Validate environment variables
  if (!process.env.GRAFANA_URL || !process.env.GRAFANA_API_KEY) {
    console.error("Error: GRAFANA_URL and GRAFANA_API_KEY must be set");
    console.error("Please set these environment variables and try again.");
    process.exit(1);
  }

  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Grafana MCP Server running on stdio");
  console.error("Available tools:");
  console.error("  - search_logs: Search Loki logs with LogQL");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

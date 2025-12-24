# Grafana MCP Server

MCP (Model Context Protocol) server for querying Grafana Loki logs. Enables Claude to search your logs using natural language.

## Features

- 🔍 Search logs using LogQL query language
- ⏰ Time-based filtering (hours back from now)
- 📊 Configurable result limits
- 📝 Markdown or JSON response formats
- 🔐 Secure API key authentication

## Installation

### Option 1: Local Development (Use from cloned repo)

**Setup:**

```bash
# Clone and build
git clone https://github.com/alludium/grafana-mcp-server.git
cd grafana-mcp-server
npm install
npm run build
```

**For Claude Desktop** - Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "grafana": {
      "command": "node",
      "args": ["/absolute/path/to/grafana-mcp-server/dist/index.js"],
      "env": {
        "GRAFANA_URL": "https://your-grafana-instance.com",
        "GRAFANA_API_KEY": "${GRAFANA_API_KEY}"
      }
    }
  }
}
```

**For Claude Code** - Add to `.claude/config.json` in your project:

```json
{
  "mcpServers": {
    "grafana": {
      "command": "node",
      "args": ["/absolute/path/to/grafana-mcp-server/dist/index.js"],
      "env": {
        "GRAFANA_URL": "https://your-grafana-instance.com",
        "GRAFANA_API_KEY": "${GRAFANA_API_KEY}"
      }
    }
  }
}
```

### Option 2: npm Package (When published)

**For Claude Desktop** - Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "grafana": {
      "command": "npx",
      "args": ["-y", "@alludium/grafana-mcp-server"],
      "env": {
        "GRAFANA_URL": "https://your-grafana-instance.com",
        "GRAFANA_API_KEY": "${GRAFANA_API_KEY}"
      }
    }
  }
}
```

**For Claude Code** - Add to `.claude/config.json` in your project:

```json
{
  "mcpServers": {
    "grafana": {
      "command": "npx",
      "args": ["-y", "@alludium/grafana-mcp-server"],
      "env": {
        "GRAFANA_URL": "https://your-grafana-instance.com",
        "GRAFANA_API_KEY": "${GRAFANA_API_KEY}"
      }
    }
  }
}
```

Set your API key in your environment:

```bash
export GRAFANA_API_KEY="your_grafana_api_key"
```

## Usage

Once configured, you can ask Claude to search logs naturally:

```
"Search our production logs for 5xx errors in the last hour"
"Find all database timeout errors from the last 24 hours"
"Show me errors in the auth service from the last 30 minutes"
```

### Direct LogQL Queries

You can also provide specific LogQL queries:

```
"Search logs with query: {app=\"web\"} |= \"error\""
"Query: {job=\"api\"} |~ \"timeout|failed\" for the last 6 hours"
```

## Tool: search_logs

Search Grafana Loki logs using LogQL query language.

**Parameters:**

- `query` (string, required): LogQL query string
  - Example: `{app="web"} |= "error"`
- `hours` (number, optional): Hours to search back from now (default: 1)
- `limit` (number, optional): Maximum number of log lines (default: 100)
- `response_format` (string, optional): "markdown" or "json" (default: "markdown")

**Example:**

```json
{
  "query": "{namespace=\"production\"} |~ \"5[0-9]{2}\"",
  "hours": 24,
  "limit": 50,
  "response_format": "markdown"
}
```

## Configuration

### Environment Variables

- `GRAFANA_URL`: Your Grafana instance URL (e.g., `https://grafana.example.com`)
- `GRAFANA_API_KEY`: API key with read access to Loki

### Getting a Grafana API Key

1. Log in to your Grafana instance
2. Go to Configuration → API Keys
3. Click "New API Key"
4. Name: "MCP Server" or similar
5. Role: Viewer (read-only access is sufficient)
6. Copy the generated key

## Development

```bash
# Clone the repository
git clone https://github.com/alludium/grafana-mcp-server.git
cd grafana-mcp-server

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Grafana URL and API key

# Run in development mode
npm run dev

# Build
npm run build

# Run built version
npm start
```

## LogQL Query Examples

```bash
# All errors from web app
{app="web"} |= "error"

# 5xx HTTP errors
{job="api"} | json | status >= 500

# Pattern matching for timeouts or failures
{service="backend"} |~ "timeout|failed"

# Specific time range with filters
{namespace="production", app="auth"} |= "login" | json | status != 200
```

## License

MIT

## Author

Alludium

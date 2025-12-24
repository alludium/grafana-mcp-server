import dotenv from "dotenv";

dotenv.config();

let clientInstance: GrafanaClient | null = null;

export class GrafanaClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = apiKey;
  }

  async queryRange(params: {
    query: string;
    start: number;
    end: number;
    limit: number;
  }): Promise<any> {
    // Build query params
    const queryParams = new URLSearchParams({
      query: params.query,
      start: params.start.toString(),
      end: params.end.toString(),
      limit: params.limit.toString(),
    });

    const url = `${this.baseUrl}/loki/api/v1/query_range?${queryParams}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Grafana API error (${response.status}): ${errorText || response.statusText}`
      );
    }

    return response.json();
  }
}

export function getClient(): GrafanaClient {
  if (!clientInstance) {
    const baseUrl = process.env.GRAFANA_URL;
    const apiKey = process.env.GRAFANA_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error(
        "GRAFANA_URL and GRAFANA_API_KEY environment variables must be set"
      );
    }

    clientInstance = new GrafanaClient(baseUrl, apiKey);
  }

  return clientInstance;
}

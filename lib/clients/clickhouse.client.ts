import { createClient } from "@clickhouse/client";

function formatClickhouseUrl(url: string): string {
  if (url.startsWith("clickhouse://")) {
    return url.replace("clickhouse://", "http://");
  }
  return url;
}

export const clickhouseClient = createClient({
  url: formatClickhouseUrl(process.env.CLICKHOUSE_URL ?? "http://default:default@localhost:8123"),
});

export default clickhouseClient;

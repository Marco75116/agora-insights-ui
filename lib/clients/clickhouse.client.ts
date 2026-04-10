import { createClient } from "@clickhouse/client";
import { env } from "@/lib/env";

function formatClickhouseUrl(url: string): string {
  if (url.startsWith("clickhouse://")) {
    return url.replace("clickhouse://", "http://");
  }
  return url;
}

export const clickhouseClient = createClient({
  url: formatClickhouseUrl(env.CLICKHOUSE_URL),
});

export default clickhouseClient;

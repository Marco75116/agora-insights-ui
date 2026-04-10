function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  get MISTI_API_KEY() {
    return requireEnv("MISTI_API_KEY");
  },
  get CLICKHOUSE_URL() {
    return optionalEnv("CLICKHOUSE_URL", "http://default:default@localhost:8123");
  },
  get NEXT_PUBLIC_BASE_URL() {
    return optionalEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000");
  },
} as const;

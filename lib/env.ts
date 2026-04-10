function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

export const env = {
  get MISTI_API_KEY() {
    return requireEnv("MISTI_API_KEY");
  },
} as const;

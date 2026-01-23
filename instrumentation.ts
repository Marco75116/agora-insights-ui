export async function register() {
  const { loadClients } = await import("@/lib/clients/load.clients");
  await loadClients();
}

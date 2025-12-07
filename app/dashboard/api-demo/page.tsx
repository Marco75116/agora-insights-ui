import { api } from "@/lib/eden";

export const dynamic = "force-dynamic";

type User = {
  id: number;
  name: string;
};

export default async function ApiDemoPage() {
  const { data: hello } = await api.api.hello.get();
  const { data: users } = await api.api.users.get();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">API Demo</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Hello Endpoint</h2>
        <p className="text-muted-foreground">{hello?.message}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Users Endpoint</h2>
        <ul className="list-inside list-disc space-y-1">
          {(users as User[])?.map((user) => (
            <li key={user.id} className="text-muted-foreground">
              {user.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

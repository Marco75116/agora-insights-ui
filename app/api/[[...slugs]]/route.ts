import { Elysia } from "elysia";

const app = new Elysia({ prefix: "/api" })
  .get("/hello", () => ({ message: "Hello from Elysia!" }))
  .get("/users", () => [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);

export const GET = app.fetch;
export const POST = app.fetch;

export type App = typeof app;

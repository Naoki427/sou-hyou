import { beforeAll, afterAll, test, expect } from "vitest";
import http from "http";
import getPort from "get-port";
import { setupMongo, teardownMongo } from "./helpers/setup.mongo.js";
import { buildApp } from "../src/server.js";

let server: http.Server;
let url: string;

async function gql(query: string, variables?: any, headers?: Record<string, string>) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...(headers || {}) },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}

beforeAll(async () => {
  await setupMongo();
  const { app } = await buildApp({ webOrigin: "http://localhost:3000" });
  const port = await getPort();
  server = http.createServer(app);
  await new Promise<void>((res) => server.listen(port, res));
  url = `http://localhost:${port}/graphql`;
});

afterAll(async () => {
  await new Promise<void>((res) => server.close(() => res()));
  await teardownMongo();
});

test("未認証で myItems は UNAUTHENTICATED", async () => {
  const j = await gql(`query { myItems { id } }`);
  expect(j.data).toBeNull();
  expect(j.errors?.[0]?.message).toContain("UNAUTHENTICATED");
});

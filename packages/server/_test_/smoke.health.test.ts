import { beforeAll, afterAll, expect, test } from "vitest";
import http from "http";
import getPort from "get-port";
import { buildApp } from "../src/server.js";

let server: http.Server;
let url: string;

beforeAll(async () => {
  const { app } = await buildApp({ webOrigin: "http://localhost:3000" });
  const port = await getPort();
  server = http.createServer(app);
  await new Promise<void>((res) => server.listen(port, res));
  url = `http://localhost:${port}/graphql`;
});

afterAll(async () => {
  await new Promise<void>((res) => server.close(() => res()));
});

test("health returns ok", async () => {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "query { health }" })
  });
  expect(resp.status).toBe(200);
  const json = await resp.json();
  expect(json.data.health).toBe("ok");
});

// ★ ここを一番上に置く（import より前）
vi.mock("../services/firebaseAdmin.js", () => ({
  getFirebaseAuth: () => ({
    verifyIdToken: async () => ({
      uid: "test-uid",
      email: "test@example.com",
      name: "Tester",
      picture: "https://example.com/a.png",
    }),
  }),
}));

import { beforeAll, afterAll, test, expect, vi } from "vitest";
import http from "http";
import getPort from "get-port";
import { setupMongo, teardownMongo } from "./helpers/setup.mongo.js";
import { buildApp } from "../src/server.js";

let server: http.Server;
let url: string;
const authz = { authorization: "Bearer dummy" };

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

test("認証後 me が返る", async () => {
  const j = await gql(`query { me { uid email name photoURL } }`, undefined, authz);
  expect(j.errors).toBeUndefined();
  expect(j.data.me.uid).toBe("test-uid");
  expect(j.data.me.email).toBe("test@example.com");
});

test("認証後 createFolder が動く", async () => {
  const j = await gql(
    `mutation($input: CreateFolderInput!) {
      createFolder(input: $input) { id name path type }
    }`,
    { input: { name: "2025", parentId: null } },
    authz
  );
  expect(j.errors).toBeUndefined();
  expect(j.data.createFolder.path).toBe("/2025");
});

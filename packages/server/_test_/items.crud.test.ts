import { beforeAll, afterAll, test, expect, vi } from "vitest";
vi.mock("../services/firebaseAdmin.js", () => ({
  getFirebaseAuth: () => ({
    verifyIdToken: async (token: string) =>
      token?.includes("userB")
        ? { uid: "user-b", email: "b@example.com" }
        : { uid: "user-a", email: "a@example.com" },
  }),
}));

import http from "http";
import getPort from "get-port";
import { setupMongo, teardownMongo } from "./helpers/setup.mongo.js";
import { buildApp } from "../src/server.js";

let server: http.Server;
let url: string;
const authA = { authorization: "Bearer userA" };
const authB = { authorization: "Bearer userB" };

async function gql(query: string, variables?: any, headers?: Record<string,string>) {
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
}, 20000);

afterAll(async () => {
  await new Promise<void>((res) => server.close(() => res()));
  await teardownMongo();
}, 20000);

/** 1) 作成→一覧→取得（Aユーザー） */
test("A: folder→memo→list→get", async () => {
  const r1 = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id name path type } }`,
    { input: { name: "2025", parentId: null } }, authA
  );
  expect(r1.errors).toBeUndefined();
  const y2025 = r1.data.createFolder;

  const r2 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id name path type } }`,
    { input: { name: "七夕賞", parentId: y2025.id, horses: [] } }, authA
  );
  expect(r2.errors).toBeUndefined();
  const memo = r2.data.createMemo;

  const r3 = await gql(
    `query($pid:ID){ myItems(parentId:$pid){ id name path type } }`,
    { pid: y2025.id }, authA
  );
  expect(r3.errors).toBeUndefined();
  expect(r3.data.myItems.some((x: any) => x.id === memo.id)).toBe(true);

  const r4 = await gql(
    `query($id:ID!){ item(id:$id){ id name path type } }`,
    { id: memo.id }, authA
  );
  expect(r4.errors).toBeUndefined();
  expect(r4.data.item.id).toBe(memo.id);
}, 20000);

/** 2) 重複パスエラー（PATH_EXISTS） */
test("A: duplicate memo name under same parent → PATH_EXISTS", async () => {
  const rFolder = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id path } }`,
    { input: { name: "dup", parentId: null } }, authA
  );
  const parentId = rFolder.data.createFolder.id;

  await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id } }`,
    { input: { name: "同名", parentId, horses: [] } }, authA
  );
  const r2 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id } }`,
    { input: { name: "同名", parentId, horses: [] } }, authA
  );

  const msg = r2.errors?.[0]?.message ?? "";
  expect(msg.includes("PATH_EXISTS")).toBe(true);
}, 20000);

/** 3) オーナー分離（Aが作った item はBから見えない） */
test("owner isolation: B cannot see A's items", async () => {
  const r1 = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id path } }`,
    { input: { name: "private", parentId: null } }, authA
  );
  const pid = r1.data.createFolder.id;

  const r2 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id } }`,
    { input: { name: "秘密メモ", parentId: pid, horses: [] } }, authA
  );
  const memoId = r2.data.createMemo.id;

  // B から一覧 → 何も見えない
  const listB = await gql(
    `query($pid:ID){ myItems(parentId:$pid){ id } }`,
    { pid }, authB
  );
  expect(listB.errors).toBeUndefined();
  expect(listB.data.myItems.length).toBe(0);

  // B から直接取得 → 実装に合わせて null or FORBIDDEN のどちらか
  const gotB = await gql(`query($id:ID!){ item(id:$id){ id } }`, { id: memoId }, authB);
  if (gotB.errors) {
    expect(gotB.errors[0].message).toMatch(/FORBIDDEN|NOT_FOUND|UNAUTHORIZED/i);
  } else {
    expect(gotB.data.item).toBeNull(); // あなたの実装が null を返すならこちら
  }
}, 20000);

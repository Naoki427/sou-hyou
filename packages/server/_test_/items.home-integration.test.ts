import { beforeAll, afterAll, test, expect, vi } from "vitest";
vi.mock("../src/services/firebaseAdmin.js", () => ({
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

/** Home Page Integration Tests */

test("Home: create folder and memo structure", async () => {
  // フォルダ作成
  const r1 = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id name path type } }`,
    { input: { name: "2025年", parentId: null } },
    authA
  );
  expect(r1.errors).toBeUndefined();
  const year2025 = r1.data.createFolder;
  expect(year2025.type).toBe("FOLDER");
  expect(year2025.path).toBe("/2025年");

  // サブフォルダ作成
  const r2 = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id name path type } }`,
    { input: { name: "中央競馬", parentId: year2025.id } },
    authA
  );
  expect(r2.errors).toBeUndefined();
  const jra = r2.data.createFolder;
  expect(jra.path).toBe("/2025年/中央競馬");

  // メモ作成（8頭立て）
  const r3 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id name path type horses { name predictionMark fields { label type value } } } }`,
    { 
      input: { 
        name: "東京2R", 
        parentId: jra.id,
        horses: Array(8).fill(null).map(() => ({
          name: "",
          predictionMark: "MUZIRUSHI",
          fields: []
        }))
      } 
    },
    authA
  );
  expect(r3.errors).toBeUndefined();
  const memo = r3.data.createMemo;
  expect(memo.type).toBe("MEMO");
  expect(memo.path).toBe("/2025年/中央競馬/東京2R");
  expect(memo.horses).toHaveLength(8);

  // ルートレベルのアイテム一覧取得
  const r4 = await gql(
    `query($parentId:ID){ myItems(parentId:$parentId){ id name path type } }`,
    { parentId: null },
    authA
  );
  expect(r4.errors).toBeUndefined();
  expect(r4.data.myItems.some((item: any) => item.id === year2025.id)).toBe(true);

  // フォルダ内のアイテム一覧取得
  const r5 = await gql(
    `query($parentId:ID){ myItems(parentId:$parentId){ id name path type } }`,
    { parentId: year2025.id },
    authA
  );
  expect(r5.errors).toBeUndefined();
  expect(r5.data.myItems.some((item: any) => item.id === jra.id)).toBe(true);

  // サブフォルダ内のメモ一覧取得
  const r6 = await gql(
    `query($parentId:ID){ myItems(parentId:$parentId){ id name path type } }`,
    { parentId: jra.id },
    authA
  );
  expect(r6.errors).toBeUndefined();
  expect(r6.data.myItems.some((item: any) => item.id === memo.id)).toBe(true);
}, 20000);

test("Home: itemByPath resolution for navigation", async () => {
  // ルートフォルダ作成
  const r1 = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id name path type } }`,
    { input: { name: "競馬場", parentId: null } },
    authA
  );
  const racecourse = r1.data.createFolder;

  // サブフォルダ作成
  const r2 = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id name path type } }`,
    { input: { name: "東京競馬場", parentId: racecourse.id } },
    authA
  );
  const tokyo = r2.data.createFolder;

  // パスによるアイテム解決テスト
  const r3 = await gql(
    `query($path:String!){ itemByPath(path:$path){ id name path type } }`,
    { path: "/競馬場" },
    authA
  );
  expect(r3.errors).toBeUndefined();
  expect(r3.data.itemByPath.id).toBe(racecourse.id);

  // ネストしたパスによる解決
  const r4 = await gql(
    `query($path:String!){ itemByPath(path:$path){ id name path type } }`,
    { path: "/競馬場/東京競馬場" },
    authA
  );
  expect(r4.errors).toBeUndefined();
  expect(r4.data.itemByPath.id).toBe(tokyo.id);

  // 存在しないパス
  const r5 = await gql(
    `query($path:String!){ itemByPath(path:$path){ id name path type } }`,
    { path: "/存在しないパス" },
    authA
  );
  expect(r5.errors).toBeUndefined();
  expect(r5.data.itemByPath).toBeNull();
}, 20000);

test("Home: recent memos functionality", async () => {
  const timestamp1 = Date.now();
  
  // 複数のメモを作成
  const r1 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id name updatedAt } }`,
    { 
      input: { 
        name: `レース1-${timestamp1}`, 
        parentId: null,
        horses: Array(6).fill(null).map(() => ({
          name: "",
          predictionMark: "MUZIRUSHI", 
          fields: []
        }))
      } 
    },
    authA
  );
  const memo1 = r1.data.createMemo;

  // 少し後に別のメモを作成
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const r2 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id name updatedAt } }`,
    { 
      input: { 
        name: `レース2-${timestamp1}`, 
        parentId: null,
        horses: Array(8).fill(null).map(() => ({
          name: "",
          predictionMark: "MUZIRUSHI",
          fields: []
        }))
      } 
    },
    authA
  );
  const memo2 = r2.data.createMemo;

  // 最近のメモ一覧取得
  const r3 = await gql(
    `query($limit:Int){ myRecentMemos(limit:$limit){ id name path updatedAt } }`,
    { limit: 5 },
    authA
  );
  expect(r3.errors).toBeUndefined();
  const recentMemos = r3.data.myRecentMemos;
  
  // 作成したメモが含まれていることを確認
  expect(recentMemos.some((m: any) => m.id === memo1.id)).toBe(true);
  expect(recentMemos.some((m: any) => m.id === memo2.id)).toBe(true);
  
  // 更新日時順になっていることを確認（新しいものが先頭）
  const memo2Index = recentMemos.findIndex((m: any) => m.id === memo2.id);
  const memo1Index = recentMemos.findIndex((m: any) => m.id === memo1.id);
  expect(memo2Index).toBeLessThan(memo1Index);
}, 20000);

test("Home: user isolation for home page data", async () => {
  // ユーザーAがフォルダとメモを作成
  const r1 = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id path } }`,
    { input: { name: "Aのフォルダ", parentId: null } },
    authA
  );
  const folderA = r1.data.createFolder;

  const r2 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id path } }`,
    { 
      input: { 
        name: "Aのメモ", 
        parentId: folderA.id,
        horses: Array(4).fill(null).map(() => ({
          name: "",
          predictionMark: "MUZIRUSHI",
          fields: []
        }))
      } 
    },
    authA
  );
  const memoA = r2.data.createMemo;

  // ユーザーBからユーザーAのアイテムが見えないことを確認
  const r3 = await gql(
    `query($parentId:ID){ myItems(parentId:$parentId){ id name } }`,
    { parentId: null },
    authB
  );
  expect(r3.errors).toBeUndefined();
  expect(r3.data.myItems.some((item: any) => item.id === folderA.id)).toBe(false);

  // パスによる直接アクセスも拒否される
  const r4 = await gql(
    `query($path:String!){ itemByPath(path:$path){ id } }`,
    { path: folderA.path },
    authB
  );
  expect(r4.errors).toBeUndefined();
  expect(r4.data.itemByPath).toBeNull();

  // 最近のメモでも見えない
  const r5 = await gql(
    `query($limit:Int){ myRecentMemos(limit:$limit){ id } }`,
    { limit: 10 },
    authB
  );
  expect(r5.errors).toBeUndefined();
  expect(r5.data.myRecentMemos.some((memo: any) => memo.id === memoA.id)).toBe(false);
}, 20000);

test("Home: path encoding with special characters", async () => {
  // 特殊文字を含むフォルダ作成
  const r1 = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id name path type } }`,
    { input: { name: "G1レース(2025)", parentId: null } },
    authA
  );
  expect(r1.errors).toBeUndefined();
  const folder = r1.data.createFolder;
  expect(folder.path).toBe("/G1レース(2025)");

  // パスによる解決
  const r2 = await gql(
    `query($path:String!){ itemByPath(path:$path){ id name } }`,
    { path: "/G1レース(2025)" },
    authA
  );
  expect(r2.errors).toBeUndefined();
  expect(r2.data.itemByPath.id).toBe(folder.id);

  // 日本語とスペースを含むメモ
  const r3 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id name path } }`,
    { 
      input: { 
        name: "有馬記念 2025", 
        parentId: folder.id,
        horses: Array(16).fill(null).map(() => ({
          name: "",
          predictionMark: "MUZIRUSHI",
          fields: []
        }))
      } 
    },
    authA
  );
  expect(r3.errors).toBeUndefined();
  const memo = r3.data.createMemo;
  expect(memo.path).toBe("/G1レース(2025)/有馬記念 2025");
}, 20000);

test("Home: folder and memo creation with various horse counts", async () => {
  // 4頭立てメモ（最小）
  const r1 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id horses { name predictionMark } } }`,
    { 
      input: { 
        name: "4頭立て", 
        parentId: null,
        horses: Array(4).fill(null).map(() => ({
          name: "",
          predictionMark: "MUZIRUSHI",
          fields: []
        }))
      } 
    },
    authA
  );
  expect(r1.errors).toBeUndefined();
  expect(r1.data.createMemo.horses).toHaveLength(4);

  // 18頭立てメモ（最大）
  const r2 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id horses { name predictionMark } } }`,
    { 
      input: { 
        name: "18頭立て", 
        parentId: null,
        horses: Array(18).fill(null).map(() => ({
          name: "",
          predictionMark: "MUZIRUSHI",
          fields: []
        }))
      } 
    },
    authA
  );
  expect(r2.errors).toBeUndefined();
  expect(r2.data.createMemo.horses).toHaveLength(18);

  // 一般的な12頭立て
  const r3 = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id horses { name predictionMark } } }`,
    { 
      input: { 
        name: "12頭立て", 
        parentId: null,
        horses: Array(12).fill(null).map(() => ({
          name: "",
          predictionMark: "MUZIRUSHI",
          fields: []
        }))
      } 
    },
    authA
  );
  expect(r3.errors).toBeUndefined();
  expect(r3.data.createMemo.horses).toHaveLength(12);
}, 20000);

test("Home: empty folders and nested navigation", async () => {
  // 空フォルダ作成
  const r1 = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id name path } }`,
    { input: { name: "空フォルダ", parentId: null } },
    authA
  );
  const emptyFolder = r1.data.createFolder;

  // 空フォルダ内のアイテム一覧（空になることを確認）
  const r2 = await gql(
    `query($parentId:ID){ myItems(parentId:$parentId){ id name } }`,
    { parentId: emptyFolder.id },
    authA
  );
  expect(r2.errors).toBeUndefined();
  expect(r2.data.myItems).toHaveLength(0);

  // 深いネスト構造作成
  let currentParent = emptyFolder.id;
  const folderNames = ["レベル1", "レベル2", "レベル3"];
  
  for (const name of folderNames) {
    const r = await gql(
      `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id name path } }`,
      { input: { name, parentId: currentParent } },
      authA
    );
    expect(r.errors).toBeUndefined();
    currentParent = r.data.createFolder.id;
  }

  // 深いパスによる解決
  const r3 = await gql(
    `query($path:String!){ itemByPath(path:$path){ id name } }`,
    { path: "/空フォルダ/レベル1/レベル2/レベル3" },
    authA
  );
  expect(r3.errors).toBeUndefined();
  expect(r3.data.itemByPath.name).toBe("レベル3");
}, 20000);
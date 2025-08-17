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

// Helper function to create a test memo with horses
async function createTestMemo(auth: Record<string, string>) {
  const timestamp = Date.now();
  const folderResult = await gql(
    `mutation($input:CreateFolderInput!){ createFolder(input:$input){ id } }`,
    { input: { name: `test-folder-${timestamp}`, parentId: null } },
    auth
  );
  
  if (!folderResult.data?.createFolder?.id) {
    throw new Error(`Failed to create folder: ${JSON.stringify(folderResult)}`);
  }
  
  const folderId = folderResult.data.createFolder.id;

  const memoResult = await gql(
    `mutation($input:CreateMemoInput!){ createMemo(input:$input){ id horses { name predictionMark fields { label type value } } } }`,
    { 
      input: { 
        name: `test-memo-${timestamp}`, 
        parentId: folderId, 
        horses: [
          { name: "テストホース1", predictionMark: "HONMEI", fields: [] },
          { name: "テストホース2", predictionMark: "TAIKOU", fields: [{ label: "体重", type: "NUMBER", value: 480 }] }
        ]
      } 
    },
    auth
  );
  
  if (!memoResult.data?.createMemo?.id) {
    throw new Error(`Failed to create memo: ${JSON.stringify(memoResult)}`);
  }
  
  return memoResult.data.createMemo;
}

/** setHorseProp Tests */

test("setHorseProp: successfully update horse name", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $name:String) { 
      setHorseProp(memoId:$memoId, index:$index, name:$name) { 
        id horses { name predictionMark } 
      } 
    }`,
    { memoId: memo.id, index: 0, name: "新しい馬名" },
    authA
  );

  expect(result.errors).toBeUndefined();
  expect(result.data.setHorseProp.horses[0].name).toBe("新しい馬名");
  expect(result.data.setHorseProp.horses[0].predictionMark).toBe("HONMEI");
}, 20000);

test("setHorseProp: successfully update prediction mark", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $predictionMark:PredictionMark) { 
      setHorseProp(memoId:$memoId, index:$index, predictionMark:$predictionMark) { 
        horses { name predictionMark } 
      } 
    }`,
    { memoId: memo.id, index: 1, predictionMark: "CHUUI" },
    authA
  );

  expect(result.errors).toBeUndefined();
  expect(result.data.setHorseProp.horses[1].name).toBe("テストホース2");
  expect(result.data.setHorseProp.horses[1].predictionMark).toBe("CHUUI");
}, 20000);

test("setHorseProp: update both name and prediction mark", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $name:String, $predictionMark:PredictionMark) { 
      setHorseProp(memoId:$memoId, index:$index, name:$name, predictionMark:$predictionMark) { 
        horses { name predictionMark } 
      } 
    }`,
    { memoId: memo.id, index: 0, name: "両方更新", predictionMark: "KESHI" },
    authA
  );

  expect(result.errors).toBeUndefined();
  expect(result.data.setHorseProp.horses[0].name).toBe("両方更新");
  expect(result.data.setHorseProp.horses[0].predictionMark).toBe("KESHI");
}, 20000);

test("setHorseProp: trim whitespace from horse name", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $name:String) { 
      setHorseProp(memoId:$memoId, index:$index, name:$name) { 
        horses { name } 
      } 
    }`,
    { memoId: memo.id, index: 0, name: "  スペース付き  " },
    authA
  );

  expect(result.errors).toBeUndefined();
  expect(result.data.setHorseProp.horses[0].name).toBe("スペース付き");
}, 20000);

test("setHorseProp: UNAUTHENTICATED when no auth", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $name:String) { 
      setHorseProp(memoId:$memoId, index:$index, name:$name) { id } 
    }`,
    { memoId: memo.id, index: 0, name: "test" }
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/UNAUTHENTICATED/i);
}, 20000);

test("setHorseProp: MEMO_NOT_FOUND for non-existent memo", async () => {
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $name:String) { 
      setHorseProp(memoId:$memoId, index:$index, name:$name) { id } 
    }`,
    { memoId: "507f1f77bcf86cd799439011", index: 0, name: "test" },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/MEMO_NOT_FOUND/i);
}, 20000);

test("setHorseProp: MEMO_NOT_FOUND when accessing other user's memo", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $name:String) { 
      setHorseProp(memoId:$memoId, index:$index, name:$name) { id } 
    }`,
    { memoId: memo.id, index: 0, name: "test" },
    authB
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/MEMO_NOT_FOUND/i);
}, 20000);

test("setHorseProp: INDEX_OUT_OF_RANGE for negative index", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $name:String) { 
      setHorseProp(memoId:$memoId, index:$index, name:$name) { id } 
    }`,
    { memoId: memo.id, index: -1, name: "test" },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/INDEX_OUT_OF_RANGE/i);
}, 20000);

test("setHorseProp: INDEX_OUT_OF_RANGE for index beyond array", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $name:String) { 
      setHorseProp(memoId:$memoId, index:$index, name:$name) { id } 
    }`,
    { memoId: memo.id, index: 10, name: "test" },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/INDEX_OUT_OF_RANGE/i);
}, 20000);

test("setHorseProp: HORSE_NAME_TOO_LONG for name exceeding 80 chars", async () => {
  const memo = await createTestMemo(authA);
  const longName = "a".repeat(81);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $name:String) { 
      setHorseProp(memoId:$memoId, index:$index, name:$name) { id } 
    }`,
    { memoId: memo.id, index: 0, name: longName },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/HORSE_NAME_TOO_LONG/i);
}, 20000);

test("setHorseProp: INVALID_PREDICTION_MARK for invalid mark", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $predictionMark:PredictionMark) { 
      setHorseProp(memoId:$memoId, index:$index, predictionMark:$predictionMark) { id } 
    }`,
    { memoId: memo.id, index: 0, predictionMark: "INVALID_MARK" },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/INVALID_PREDICTION_MARK|Variable/i);
}, 20000);

test("setHorseProp: accept maximum length name (80 chars)", async () => {
  const memo = await createTestMemo(authA);
  const maxName = "a".repeat(80);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $name:String) { 
      setHorseProp(memoId:$memoId, index:$index, name:$name) { 
        horses { name } 
      } 
    }`,
    { memoId: memo.id, index: 0, name: maxName },
    authA
  );

  expect(result.errors).toBeUndefined();
  expect(result.data.setHorseProp.horses[0].name).toBe(maxName);
}, 20000);

/** setHorseFieldValue Tests */

test("setHorseFieldValue: successfully set new field", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { 
        horses { fields { label type value } } 
      } 
    }`,
    { memoId: memo.id, index: 0, label: "新しいフィールド", type: "NUMBER", value: 123 },
    authA
  );

  expect(result.errors).toBeUndefined();
  const fields = result.data.setHorseFieldValue.horses[0].fields;
  expect(fields.some((f: any) => f.label === "新しいフィールド" && f.type === "NUMBER" && f.value === 123)).toBe(true);
}, 20000);

test("setHorseFieldValue: successfully update existing field", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { 
        horses { fields { label type value } } 
      } 
    }`,
    { memoId: memo.id, index: 1, label: "体重", type: "NUMBER", value: 500 },
    authA
  );

  expect(result.errors).toBeUndefined();
  const field = result.data.setHorseFieldValue.horses[1].fields.find((f: any) => f.label === "体重");
  expect(field.value).toBe(500);
  expect(field.type).toBe("NUMBER");
}, 20000);

test("setHorseFieldValue: set different field types", async () => {
  const memo = await createTestMemo(authA);
  
  // NUMBER field
  const r1 = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { 
        horses { fields { label type value } } 
      } 
    }`,
    { memoId: memo.id, index: 0, label: "数値", type: "NUMBER", value: 42 },
    authA
  );
  
  // SELECT field
  const r2 = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { 
        horses { fields { label type value } } 
      } 
    }`,
    { memoId: memo.id, index: 0, label: "選択", type: "SELECT", value: "選択肢A" },
    authA
  );
  
  // COMMENT field
  const r3 = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { 
        horses { fields { label type value } } 
      } 
    }`,
    { memoId: memo.id, index: 0, label: "コメント", type: "COMMENT", value: "テストコメント" },
    authA
  );

  expect(r1.errors).toBeUndefined();
  expect(r2.errors).toBeUndefined();
  expect(r3.errors).toBeUndefined();
  
  const fields = r3.data.setHorseFieldValue.horses[0].fields;
  expect(fields.find((f: any) => f.label === "数値")?.value).toBe(42);
  expect(fields.find((f: any) => f.label === "選択")?.value).toBe("選択肢A");
  expect(fields.find((f: any) => f.label === "コメント")?.value).toBe("テストコメント");
}, 20000);

test("setHorseFieldValue: trim whitespace from field label", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { 
        horses { fields { label } } 
      } 
    }`,
    { memoId: memo.id, index: 0, label: "  スペース付きラベル  ", type: "NUMBER", value: 123 },
    authA
  );

  expect(result.errors).toBeUndefined();
  const field = result.data.setHorseFieldValue.horses[0].fields.find((f: any) => f.label === "スペース付きラベル");
  expect(field).toBeDefined();
}, 20000);

test("setHorseFieldValue: UNAUTHENTICATED when no auth", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { id } 
    }`,
    { memoId: memo.id, index: 0, label: "test", type: "NUMBER", value: 123 }
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/UNAUTHENTICATED/i);
}, 20000);

test("setHorseFieldValue: MEMO_NOT_FOUND for non-existent memo", async () => {
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { id } 
    }`,
    { memoId: "507f1f77bcf86cd799439011", index: 0, label: "test", type: "NUMBER", value: 123 },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/MEMO_NOT_FOUND/i);
}, 20000);

test("setHorseFieldValue: MEMO_NOT_FOUND when accessing other user's memo", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { id } 
    }`,
    { memoId: memo.id, index: 0, label: "test", type: "NUMBER", value: 123 },
    authB
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/MEMO_NOT_FOUND/i);
}, 20000);

test("setHorseFieldValue: INDEX_OUT_OF_RANGE for negative index", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { id } 
    }`,
    { memoId: memo.id, index: -1, label: "test", type: "NUMBER", value: 123 },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/INDEX_OUT_OF_RANGE/i);
}, 20000);

test("setHorseFieldValue: INDEX_OUT_OF_RANGE for index beyond array", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { id } 
    }`,
    { memoId: memo.id, index: 10, label: "test", type: "NUMBER", value: 123 },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/INDEX_OUT_OF_RANGE/i);
}, 20000);

test("setHorseFieldValue: FIELD_LABEL_REQUIRED for empty label", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { id } 
    }`,
    { memoId: memo.id, index: 0, label: "", type: "NUMBER", value: 123 },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/FIELD_LABEL_REQUIRED/i);
}, 20000);

test("setHorseFieldValue: FIELD_LABEL_REQUIRED for whitespace-only label", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { id } 
    }`,
    { memoId: memo.id, index: 0, label: "   ", type: "NUMBER", value: 123 },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/FIELD_LABEL_REQUIRED/i);
}, 20000);

test("setHorseFieldValue: FIELD_TYPE_MISMATCH when changing existing field type", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { id } 
    }`,
    { memoId: memo.id, index: 1, label: "体重", type: "SELECT", value: "選択肢" },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/FIELD_TYPE_MISMATCH/i);
}, 20000);

test("setHorseFieldValue: INVALID_FIELD_TYPE for invalid type", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { id } 
    }`,
    { memoId: memo.id, index: 0, label: "test", type: "INVALID_TYPE", value: 123 },
    authA
  );

  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/INVALID_FIELD_TYPE|Variable/i);
}, 20000);

test("setHorseFieldValue: set null value", async () => {
  const memo = await createTestMemo(authA);
  
  const result = await gql(
    `mutation($memoId:ID!, $index:Int!, $label:String!, $type:FieldType!, $value:JSON) { 
      setHorseFieldValue(memoId:$memoId, index:$index, label:$label, type:$type, value:$value) { 
        horses { fields { label type value } } 
      } 
    }`,
    { memoId: memo.id, index: 0, label: "null値", type: "NUMBER", value: null },
    authA
  );

  expect(result.errors).toBeUndefined();
  const field = result.data.setHorseFieldValue.horses[0].fields.find((f: any) => f.label === "null値");
  expect(field.value).toBeNull();
}, 20000);
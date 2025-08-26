import { describe, test, expect } from "vitest";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "../src/graphql/index.js";
import { resolvers } from "../src/graphql/resolvers.js";

describe("schema and resolvers are compatible", () => {
  test("builds executable schema", () => {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    expect(schema).toBeTruthy();
  });
});

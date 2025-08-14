import { expect, test } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "../graphql/index.js";

test("schema and resolvers are compatible", () => {
  const typeDefs = readFileSync(
    path.join(process.cwd(), "graphql/schema.graphql"),
    "utf8"
  );
  expect(() =>
    makeExecutableSchema({ typeDefs, resolvers })
  ).not.toThrow();
});

import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { readFileSync } from "fs";
import path from "path";
import { resolvers } from "../graphql/resolvers.js";

export async function buildApp(opts: { webOrigin: string }) {
  const typeDefs = readFileSync(
    path.join(process.cwd(), "graphql/schema.graphql"),
    "utf8"
  );

  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();

  const app = express();
  app.use(cors({ origin: opts.webOrigin }));
  app.use(express.json());
  app.use("/graphql", expressMiddleware(apollo));

  return { app, apollo };
}


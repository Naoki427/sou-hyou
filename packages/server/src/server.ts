import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { readFileSync } from "fs";
import path from "path";
import { resolvers } from "../graphql/resolvers.js";
import User from "../models/User.js";
import { getFirebaseAuth } from "../services/firebaseAdmin.js";

export async function buildApp(opts: { webOrigin: string }) {
  const typeDefs = readFileSync(path.join(process.cwd(), "graphql/schema.graphql"), "utf8");
  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();

  const app = express();
  const corsOptions = {
    origin: process.env.WEB_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(express.json());

  app.use("/graphql", expressMiddleware(apollo, {
    context: async ({ req }) => {
      const authz = req.headers.authorization;
      let user: { uid: string; email?: string } | undefined;

      if (authz?.startsWith("Bearer ")) {
        try {
          const decoded = await getFirebaseAuth().verifyIdToken(authz.slice(7));
          user = { uid: decoded.uid, email: decoded.email ?? undefined };

          await User.updateOne(
            { uid: decoded.uid },
            {
              // 新規作成時のみ入れたい固定値
              $setOnInsert: { uid: decoded.uid },

              // 毎回最新に更新したい項目
              $set: {
                email: decoded.email ?? null,
                name:  (decoded as any).name ?? null,      // Google等のプロバイダなら入ることあり
                photoURL: (decoded as any).picture ?? null
              },
            },
            { upsert: true }
          );
        } catch (e) {
          console.warn("verifyIdToken failed:", (e as Error).message);
        }
      }
      return { user };
    }
  }));

  return { app, apollo };
}

import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "../graphql/index.js"; // ← マージ済みを使う
import User from "../models/User.js";
import { getFirebaseAuth } from "../services/firebaseAdmin.js";

// GraphQLのコンテキスト型を統一
export type GraphQLContext = {
  user?: { uid: string; email?: string | null };
};

export async function buildApp(opts: { webOrigin: string }) {
  const apollo = new ApolloServer<GraphQLContext>({
    typeDefs,
    // resolvers の型が強い場合は一旦 any でもOK。後で IResolvers<unknown, GraphQLContext> に寄せると綺麗。
    resolvers: resolvers as any,
  });
  await apollo.start();

  const app = express();

  const corsOptions = {
    origin: process.env.WEB_ORIGIN || opts.webOrigin || "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware<GraphQLContext>(apollo, {
      context: async ({ req }) => {
        const authz = req.headers.authorization;
        let user: GraphQLContext["user"];

        if (authz?.startsWith("Bearer ")) {
          try {
            const decoded = await getFirebaseAuth().verifyIdToken(authz.slice(7));
            user = { uid: decoded.uid, email: decoded.email ?? null };

            await User.updateOne(
              { uid: decoded.uid },
              {
                $setOnInsert: { uid: decoded.uid },
                $set: {
                  email: decoded.email ?? null,
                  name: (decoded as any).name ?? null,
                  photoURL: (decoded as any).picture ?? null,
                },
              },
              { upsert: true }
            );
          } catch (e) {
            console.warn("verifyIdToken failed:", (e as Error).message);
          }
        }
        return { user };
      },
    })
  );

  return { app, apollo };
}

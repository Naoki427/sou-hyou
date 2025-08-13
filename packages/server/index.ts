import dotenv from "dotenv";
import http from "http";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { readFileSync } from "fs";
import path from "path";
import { connectDb } from "./services/db.js";
import { resolvers } from "./graphql/resolvers.js";

// ----------------------
// 1. 環境変数の読み込み
// ----------------------
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ----------------------
// 2. 必須環境変数のチェック
// ----------------------
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined in .env.local");
}

const PORT = Number(process.env.PORT) || 4000;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";

// ----------------------
// 3. GraphQL スキーマ読み込み
// ----------------------
const typeDefs = readFileSync(
  path.join(process.cwd(), "graphql/schema.graphql"),
  "utf8"
);

async function bootstrap() {
  // ----------------------
  // 4. MongoDB接続
  // ----------------------
  if(!MONGO_URI)
    return ;
  await connectDb(MONGO_URI);

  // ----------------------
  // 5. Apollo Server設定
  // ----------------------
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  // ----------------------
  // 6. Expressアプリ設定
  // ----------------------
  const app = express();
  app.use(cors({ origin: WEB_ORIGIN }));
  app.use("/graphql", express.json(), expressMiddleware(server));

  // ----------------------
  // 7. HTTPサーバー起動
  // ----------------------
  const httpServer = http.createServer(app);
  httpServer.listen(PORT, () => {
    console.log(`🚀 Apollo Server ready at http://localhost:${PORT}/graphql`);
  });
}

bootstrap().catch(console.error);

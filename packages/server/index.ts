import "dotenv/config";
import http from "http";
import { connectDb } from "./services/db.js";
import { buildApp } from "./src/server.js";

const PORT = Number(process.env.PORT) || 4000;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";
const MONGO_URI = process.env.MONGO_URI!;

async function main() {
  await connectDb(MONGO_URI);
  const { app } = await buildApp({ webOrigin: WEB_ORIGIN });

  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`🚀 Apollo Server ready at http://localhost:${PORT}/graphql`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

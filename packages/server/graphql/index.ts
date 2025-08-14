import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { resolvers } from "./resolvers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const typeDefs = mergeTypeDefs(
  loadFilesSync(path.join(__dirname, "./**/*.graphql"))
);

export { resolvers };

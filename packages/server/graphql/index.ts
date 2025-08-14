import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SDL はそのまま
export const typeDefs = mergeTypeDefs(
  loadFilesSync(path.join(__dirname, "./**/*.graphql"))
);

// resolver は *.resolver.ts/js だけ拾う
export const resolvers = mergeResolvers(
  loadFilesSync(path.join(__dirname, "./**/*.resolver.@(ts|js)"))
);

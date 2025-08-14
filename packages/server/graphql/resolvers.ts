import { mergeResolvers } from "@graphql-tools/merge";
import scalarResolver from "./scalars/scalar.resolver.js";
import userResolver from "./users/user.resolver.js";
import itemResolver from "./items/item.resolver.js";

export const resolvers = mergeResolvers([
  scalarResolver,
  userResolver,
  itemResolver,
]);

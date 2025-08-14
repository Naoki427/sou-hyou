import { mergeResolvers } from "@graphql-tools/merge";
import baseResolver   from "./base.resolver.js";
import scalarResolver from "./scalars/scalar.resolver.js";
import userResolver from "./users/user.resolver.js";
import itemResolver from "./items/item.resolver.js";

export const resolvers = mergeResolvers([
    baseResolver,
    scalarResolver,
    userResolver,
    itemResolver,
]);

// apps/web/src/lib/apollo-client.ts
"use client";
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { auth } from "./firebase";
import { onIdTokenChanged } from "firebase/auth";

let cachedToken: string | undefined;
onIdTokenChanged(auth, async (user) => {
  cachedToken = user ? await user.getIdToken() : undefined;
});

const http = new HttpLink({ uri: process.env.NEXT_PUBLIC_GRAPHQL_URL });

const authLink = setContext((_, { headers }) => ({
  headers: { ...headers, ...(cachedToken ? { Authorization: `Bearer ${cachedToken}` } : {}) }
}));

export const client = new ApolloClient({
  link: from([authLink, http]),
  cache: new InMemoryCache(),
});
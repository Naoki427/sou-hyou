"use client";
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { auth } from "./firebase";
import { onAuthStateChanged, onIdTokenChanged } from "firebase/auth";

let cachedToken: string | undefined;
let initialized = false;

const authReady = new Promise<void>((resolve) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) cachedToken = await user.getIdToken();
    if (!initialized) {
      initialized = true;
      resolve();
    }
  });
});

onIdTokenChanged(auth, async (user) => {
  cachedToken = user ? await user.getIdToken() : undefined;
});

const http = new HttpLink({ uri: process.env.NEXT_PUBLIC_GRAPHQL_URL });

const authLink = setContext(async (_, { headers }) => {
  if (!initialized) await authReady;

  const token =
    cachedToken ??
    (auth.currentUser ? await auth.currentUser.getIdToken() : undefined);

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const client = new ApolloClient({
  link: from([authLink, http]),
  cache: new InMemoryCache(),
});
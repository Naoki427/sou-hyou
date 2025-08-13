"use client";
import { ApolloProvider, gql, useQuery } from "@apollo/client";
import { client } from "../lib/apollo-client";

const HEALTH = gql`query { health }`;

function HealthCheck() {
  const { data, loading } = useQuery(HEALTH);
  if (loading) return <p>Loading...</p>;
  return <p>Health: {data?.health}</p>;
}

export default function Page() {
  return (
    <ApolloProvider client={client}>
      <main style={{ padding: 24 }}>
        <h1>sou-hyou</h1>
        <HealthCheck />
      </main>
    </ApolloProvider>
  );
}
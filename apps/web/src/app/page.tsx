"use client";
import { ApolloProvider, gql, useQuery } from "@apollo/client";
import { client } from "../lib/apollo-client";
import { Header } from "@/components/Header";

const HEALTH = gql`query { health }`;

function HealthCheck() {
  const { data, loading } = useQuery(HEALTH);
  if (loading) return <p>Loading...</p>;
  return <p>Health: {data?.health}</p>;
}

export default function Page() {
  return (
    <>
    <Header />
      <main style={{ padding: 24 }}>
        <h1>これはルートページです</h1>
        <HealthCheck />
      </main>
    </>
  );
}
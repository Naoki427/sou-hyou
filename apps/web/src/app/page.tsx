"use client";
import { gql, useQuery } from "@apollo/client";
import { GuestOnly } from "@/components/auth/GuestOnly";
import Link from "next/link";

const HEALTH = gql`query { health }`;

function HealthCheck() {
  const { data, loading } = useQuery(HEALTH);
  if (loading) return <p>Loading...</p>;
  return <p>Health: {data?.health}</p>;
}

export default function Page() {
  return (
    <GuestOnly>
      <div style={{ padding: 24 }}>
        <h1>これはルートページです</h1>
        <div>デプロイテスト用メッセージ</div>
        <HealthCheck />
        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <Link
            href="/login"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            ログイン
          </Link>
        </div>
      </div>
    </GuestOnly>
  );
}
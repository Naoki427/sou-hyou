"use client";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useState } from "react";

const MY_ITEMS = gql`
  query MyItems($parentId: ID) {
    myItems(parentId: $parentId) {
      id
      type
      name
      path
    }
  }
`;

export default function ItemsPage() {
  const [parentId, setParentId] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery(MY_ITEMS, {
    variables: { parentId },
    fetchPolicy: "cache-and-network",
  });

  return (
    <main style={{ padding: 16 }}>
      <h1>アイテム一覧</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => { setParentId(null); refetch({ parentId: null }); }}>
          ルートへ
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#c00" }}>{error.message}</p>}

      <ul style={{ display: "grid", gap: 8, listStyle: "none", padding: 0 }}>
        {data?.myItems?.map((it: any) => (
          <li key={it.id}
              style={{ padding: 10, border: "1px solid #eee", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{it.type === "folder" ? "📁" : "📝"} {it.name}</strong>
              <div style={{ color: "#888", fontSize: 12 }}>{it.path}</div>
            </div>
            <div>
              {it.type === "folder" ? (
                <button onClick={() => { setParentId(it.id); refetch({ parentId: it.id }); }}>
                  開く
                </button>
              ) : (
                <Link href={`/memos/${it.id}`}>開く</Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

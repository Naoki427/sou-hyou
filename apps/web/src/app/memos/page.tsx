"use client";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";

const CREATE_MEMO = gql`
  mutation($input: CreateMemoInput!) {
    createMemo(input: $input) { id name path type }
  }
`;

export default function NewMemoPage() {
  const [name, setName] = useState("");
  const [createMemo, { data, loading, error }] = useMutation(CREATE_MEMO);

  return (
    <main style={{ padding: 16, display: "grid", gap: 12, maxWidth: 520 }}>
      <h1>メモを作成</h1>
      <form onSubmit={async (e) => {
        e.preventDefault();
        await createMemo({
          variables: {
            input: { name, parentId: null, horses: [] }
          }
        });
      }}>
        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="七夕賞"
          required
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button disabled={loading} style={{ padding: "10px 12px" }}>作成</button>
      </form>
      {error && <div style={{ color: "#c00" }}>{error.message}</div>}
      {data && <div>作成OK: {data.createMemo.path}</div>}
    </main>
  );
}

"use client";
import Link from "next/link";
import { gql, useQuery } from "@apollo/client";
import React from "react";

const RECENT = gql`
  query Recent($limit: Int) {
    myRecentMemos(limit: $limit) {
      id name path updatedAt
    }
  }
`;

type RecentMemo = {
  id: string;
  name: string;
  path: string;
  updatedAt: string;
};

export function RecentMemosTile(): React.JSX.Element {
  const { data, loading } = useQuery(RECENT, { variables: { limit: 5 } });

  return (
    <div className="tile" aria-busy={loading}>
      <div className="head">
        <ClockIcon />
        <span>最近のメモ</span>
      </div>
      <ul className="list">
        {(data?.myRecentMemos ?? []).map((m: RecentMemo) => (
          <li key={m.id}>
            <Link href={`/home${m.path}`} className="row" title={m.name}>
              <NoteIcon />
              <span className="name">{m.name}</span>
            </Link>
          </li>
        ))}
        {!loading && (!data?.myRecentMemos?.length) && (
          <li className="empty">最近の更新はありません</li>
        )}
      </ul>
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
.tile { display:grid; gap:10px; padding:12px; border:1px solid #eaeaea; border-radius:10px; background:#fff; }
.head { display:flex; align-items:center; gap:8px; font-weight:600; }
.list { display:grid; gap:6px; margin:0; padding:0; list-style:none; }
.row { display:flex; align-items:center; gap:8px; text-decoration:none; color:#222; padding:6px 4px; border-radius:8px; }
.row:hover { background:#f7f7f7; }
.name { font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.empty { color:#777; font-size:12px; padding:6px 2px; }
`;
function ClockIcon(): React.JSX.Element {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
  </svg>;
}
function NoteIcon(): React.JSX.Element {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h6"/>
  </svg>;
}

"use client";
import Link from "next/link";
import { gql, useQuery } from "@apollo/client";
import React from "react";

const RECENT = gql`
  query Recent($limit: Int) {
    myRecentMemos(limit: $limit) {
      id
      name
      path
      updatedAt
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
  const items: RecentMemo[] = data?.myRecentMemos ?? [];

  return (
    <section className="rm-tile" aria-busy={loading}>
      <header className="rm-head">
        <ClockIcon />
        <span>最近のメモ</span>
      </header>

      <ul className="rm-list" role="list">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <li key={`sk-${i}`} className="rm-skel" aria-hidden />
            ))
          : items.length > 0
          ? items.map((m) => (
              <li key={m.id} className="rm-item">
                <Link href={`/home${m.path}`} className="rm-row" title={m.name}>
                  <NoteIcon />
                  <span className="rm-texts">
                    <span className="rm-name">{m.name}</span>
                    <span className="rm-sub">
                      <time dateTime={m.updatedAt}>{formatRelativeJa(m.updatedAt)}</time>
                    </span>
                  </span>
                </Link>
              </li>
            ))
          : (
            <li className="rm-empty">最近の更新はありません</li>
          )}
      </ul>

      <style jsx>{styles}</style>
    </section>
  );
}

function formatRelativeJa(iso?: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";

  const diffMs = Date.now() - t;
  const sign = diffMs > 0 ? -1 : 1;
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("ja", { numeric: "auto" });

  if (absMs < 60_000)        return rtf.format(sign * Math.round(absMs / 1_000), "second");
  if (absMs < 3_600_000)     return rtf.format(sign * Math.round(absMs / 60_000), "minute");
  if (absMs < 86_400_000)    return rtf.format(sign * Math.round(absMs / 3_600_000), "hour");
  if (absMs < 7*86_400_000)  return rtf.format(sign * Math.round(absMs / 86_400_000), "day");
  if (absMs < 30*86_400_000) return rtf.format(sign * Math.round(absMs / (7*86_400_000)), "week");
  if (absMs < 365*86_400_000)return rtf.format(sign * Math.round(absMs / (30*86_400_000)), "month");
  return rtf.format(sign * Math.round(absMs / (365*86_400_000)), "year");
}

const styles = `
.rm-tile{
  box-sizing:border-box;
  width:100%;
  border:1px solid #e5e7eb;
  border-radius:12px;
  background:#fff;
  padding:12px;
  box-shadow:0 1px 3px rgba(0,0,0,.06);
  text-align:left;
}
.rm-head{
  display:flex; align-items:center; gap:8px;
  font-weight:600; color:#374151; margin-bottom:8px;
}
.rm-list{ margin:0; padding:0; list-style:none; display:grid; gap:6px; }

.rm-item{ margin:0; padding:0; }

.rm-row{
  display:flex; align-items:flex-start; gap:10px;
  width:100%; min-width:0; /* ← はみ出し対策 */
  text-decoration:none; color:#111827;
  padding:8px; border-radius:10px;
  transition:background-color .15s ease, transform .06s ease;
}
.rm-row:hover{ background:#f9fafb; }
.rm-row:active{ transform:translateY(1px); }
.rm-row svg{ flex:0 0 auto; width:18px; height:18px; color:#6b7280; margin-top:2px; }

.rm-texts{ display:flex; flex-direction:column; gap:2px; flex:1 1 auto; min-width:0; }
.rm-name{
  font-size:14px; line-height:1.35; color:#111827;
  display:-webkit-box; -webkit-box-orient:vertical;
  -webkit-line-clamp:2; overflow:hidden; /* ← 2行まで表示 */
}
.rm-sub{
  font-size:12px; color:#6b7280; line-height:1.2;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}

.rm-empty{
  color:#9ca3af; font-size:13px; padding:10px; text-align:center;
  border:1px dashed #e5e7eb; border-radius:8px; background:#fcfcfd;
}

/* ローディングのスケルトン */
.rm-skel{
  height:38px; border-radius:10px;
  background:linear-gradient(90deg,#f3f4f6 25%,#eceff1 37%,#f3f4f6 63%);
  background-size:400% 100%; animation:rm-shimmer 1.2s infinite linear;
}
@keyframes rm-shimmer {
  0%{ background-position:200% 0; }
  100%{ background-position:-200% 0; }
}

/* コンパクト化（狭い幅） */
@media (max-width: 340px){
  .rm-row{ padding:6px; gap:8px; }
  .rm-name{ -webkit-line-clamp:1; } /* スペースないときは1行に */
}
`;

function ClockIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function NoteIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h6" />
    </svg>
  );
}

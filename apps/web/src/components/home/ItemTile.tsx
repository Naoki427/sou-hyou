"use client";
import Link from "next/link";
import { Item } from "./types";

export function ItemTile({ item }: { item: Item }) {
  const isFolder = item.type === "FOLDER";
  const href = `/home${item.path}`;

  return (
    <Link href={href} className="tile" title={item.name}>
      <div className="icon" aria-hidden>
        {isFolder ? <FolderIcon /> : <MemoIcon />}
      </div>
      <div className="name">{item.name}</div>
      <style jsx>{styles}</style>
    </Link>
  );
}

const styles = `
.tile {
  display:grid; place-items:center; gap:8px; padding:14px 10px;
  border:1px solid #eaeaea; border-radius:10px; background:#fff;
  text-decoration:none; color:#222; text-align:center;
}
.tile:hover { background:#fafafa; }
.icon { width:40px; height:40px; }
.name { font-size:12px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
`;

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
    </svg>
  );
}
function MemoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="3" width="16" height="18" rx="2"/>
      <path d="M8 8h8M8 12h8M8 16h6"/>
    </svg>
  );
}

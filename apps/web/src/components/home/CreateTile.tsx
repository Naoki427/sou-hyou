"use client";
import React from "react";

type Props = {
  kind: "folder" | "memo";
  parentId: string | null;
  parentPath: string;
};

export function CreateTile({ kind, parentId, parentPath }: Props) {
  const label = kind === "folder" ? "フォルダを作成" : "メモを作成";

  const handleClick = () => {
    const eventName = kind === "folder" ? "open-create-folder" : "open-create-memo";
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { parentId, parentPath }
    }));
  };

  return (
    <button
      onClick={handleClick}
      className="tile action"
      aria-label={label}
    >
      <div className="icon" aria-hidden>
        {kind === "folder" ? <FolderPlusIcon /> : <NotePlusIcon />}
      </div>
      <div className="name">{label}</div>
      <style jsx>{styles}</style>
    </button>
  );
}

const styles = `
.tile {
  display:grid; place-items:center; gap:8px; padding:14px 10px;
  border:1px solid #eaeaea; border-radius:10px; background:#fff;
  cursor:pointer; text-align:center;
}
.tile:hover { background:#fafafa; }
.tile .icon { width:40px; height:40px; }
.tile .name { font-size:12px; color:#333; }
.tile.action { border-style:dashed; }
`;

function FolderPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
      <path d="M12 12v6M9 15h6"/>
    </svg>
  );
}
function NotePlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="3" width="16" height="18" rx="2"/>
      <path d="M8 8h8M8 12h8M12 16h4M10 16H8M12 10v6M9 13h6"/>
    </svg>
  );
}

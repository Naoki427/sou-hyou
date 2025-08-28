"use client";
import React from "react";
import Image from "next/image";

type Props = {
  kind: "folder" | "memo";
  parentId: string | null;
  parentPath: string;
};

const ICON_SIZE = 56;

export function CreateTile({ kind, parentId, parentPath }: Props) {
  const label = kind === "folder" ? "フォルダを作成" : "メモを作成";

  const handleClick = () => {
    const eventName = kind === "folder" ? "open-create-folder" : "open-create-memo";
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { parentId, parentPath },
      })
    );
  };

  return (
    <button onClick={handleClick} className="tile action" aria-label={label}>
      <div className="icon" aria-hidden>
        <Image
          src={kind === "folder" ? "/add_folder.svg" : "/add_memo.svg"}
          alt=""
          width={ICON_SIZE}
          height={ICON_SIZE}
          draggable={false}
          priority={false}
        />
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
.tile .icon { width:${ICON_SIZE}px; height:${ICON_SIZE}px; display:grid; place-items:center; }
.tile .name { font-size:12px; color:#333; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tile.action { border-style:dashed; }
`;

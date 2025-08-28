"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import ItemMenu from "./ItemMenu";
import { Item } from "./types";

const ICON_SIZE_FOLDER = 60;
const ICON_SIZE_MEMO = 48;

export function ItemTile({ item }: { item: Item }) {
  const isFolder = item.type === "FOLDER";
  const href = `/home${item.path}`;
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const iconSize = isFolder ? ICON_SIZE_FOLDER : ICON_SIZE_MEMO;

  return (
    <div
      className="tile"
      style={{ position: "relative", border: "1px solid #eaeaea", borderRadius: 10, background: "#fff" }}
    >
      <Link
        href={href}
        title={item.name}
        className="tile-link"
        style={{
          display: "grid",
          gridAutoFlow: "row",
          rowGap: 8,
          justifyItems: "center",
          alignItems: "center",
          padding: "14px 10px",
          minHeight: 108,
          textDecoration: "none",
          color: "#222",
          textAlign: "center",
          width: "100%",
        }}
      >
        {/* アイコン枠は最大サイズで固定し中央寄せ */}
        <div
          className="icon"
          aria-hidden
          style={{
            display: "grid",
            placeItems: "center",
            width: ICON_SIZE_FOLDER,
            height: ICON_SIZE_FOLDER,
          }}
        >
          <Image
            src={isFolder ? "/folder.svg" : "/memo.svg"}
            alt=""                // 装飾なので空alt
            width={iconSize}
            height={iconSize}
            draggable={false}
            priority={false}
          />
        </div>

        <div
          className="name"
          style={{
            display: "block",
            width: "100%",
            fontSize: 12,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </div>
      </Link>

      {/* 右上の 3 点ボタン（Link の外・絶対配置） */}
      <button
        ref={anchorRef}
        type="button"
        aria-label="More options"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          background: "transparent",
          border: 0,
          padding: 4,
          lineHeight: 0,
          borderRadius: 6,
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      <ItemMenu
        anchorRef={anchorRef}
        onRename={() => console.log("rename", item)}
        onDelete={() => console.log("delete", item)}
      />
    </div>
  );
}

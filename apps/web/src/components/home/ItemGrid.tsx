"use client";
import React, { ReactNode } from "react";
import { Item } from "./types";
import { ItemTile } from "./ItemTile";

type Props = {
  headerTiles: ReactNode;
  items: Item[];
};

export function ItemGrid({ headerTiles, items }: Props) {
  return (
    <section className="wrap">
      <div className="grid head">{headerTiles}</div>

      <h2 className="sec">この階層</h2>
      <div className="grid body">
        {items.length ? (
          items.map((it) => <ItemTile key={it.id} item={it} />)
        ) : (
          <div className="empty">アイテムはありません</div>
        )}
      </div>

      <style jsx>{`
        .wrap { display:grid; gap:16px; }
        .sec { margin:6px 2px 0; font-size:14px; color:#666; }
        .grid {
          display:grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap:12px;
        }
        .head { margin-bottom:4px; }
        .body { min-height:80px; }
        .empty {
          border:1px dashed #e2e2e2; border-radius:10px; padding:16px; color:#777;
          grid-column: 1/-1; text-align:center;
        }
      `}</style>
    </section>
  );
}

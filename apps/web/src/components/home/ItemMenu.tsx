"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type AnchorRef =
  | React.RefObject<HTMLButtonElement | null>
  | React.MutableRefObject<HTMLButtonElement | null>;

export default function ItemMenu({
  anchorRef,
  itemId,
  itemName,
  onRename,
  onDelete,
}: {
  anchorRef: AnchorRef;
  itemId: string;
  itemName?: string;
  onRename?: () => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const MENU_WIDTH = 200;

  // アンカー（3点ボタン）押下でトグル & 位置算出
  useEffect(() => {
    const btn = anchorRef.current;
    if (!btn) return;
    const onBtnDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const r = btn.getBoundingClientRect();
      const top = Math.min(window.innerHeight - 8, r.bottom + 4);
      const left = Math.min(
        window.innerWidth - 8 - MENU_WIDTH,
        Math.max(8, r.right - MENU_WIDTH)
      );
      setPos({ top, left });
      setOpen((v) => !v);
    };
    btn.addEventListener("pointerdown", onBtnDown, true);
    return () => btn.removeEventListener("pointerdown", onBtnDown, true);
  }, [anchorRef]);

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: Event) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDocDown, true);
    return () => document.removeEventListener("pointerdown", onDocDown, true);
  }, [open]);

  // Esc / スクロール / リサイズで閉じる
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScrollOrResize = () => setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize, true);
    };
  }, [open]);

  const fireRename = () => {
    setOpen(false);
    if (onRename) return onRename();
    window.dispatchEvent(
      new CustomEvent("open-rename-item", {
        detail: { id: itemId, name: itemName ?? "" },
      })
    );
  };

  const fireDelete = () => {
    setOpen(false);
    if (onDelete) return onDelete();
    window.dispatchEvent(
      new CustomEvent("open-delete-item", {
        detail: { id: itemId, name: itemName ?? "" },
      })
    );
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        minWidth: MENU_WIDTH,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        zIndex: 10000,
        padding: 4,
      }}
      onPointerDown={(e) => {
        // メニュー内での操作で外側ハンドラが走らないように
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <MenuBtn onClick={fireRename}>名前を変更</MenuBtn>
      <hr style={{ margin: "6px 0", border: 0, borderTop: "1px solid #eee" }} />
      <MenuBtn danger onClick={fireDelete}>削除</MenuBtn>
    </div>,
    document.body
  );
}

function MenuBtn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        border: 0,
        background: "transparent",
        cursor: "pointer",
        fontSize: 14,
        color: danger ? "#b91c1c" : "inherit",
        borderRadius: 6,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

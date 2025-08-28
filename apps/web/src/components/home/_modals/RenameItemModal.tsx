"use client";
import { gql, useMutation } from "@apollo/client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const UPDATE_ITEM = gql`
  mutation UpdateItem($input: UpdateItemInput!) {
    updateItem(input: $input) {
      success
      updatedItem {
        id
        name
        path
        updatedAt
        __typename
      }
    }
  }
`;

export function RenameItemModal({
  open,
  onClose,
  id,
  initialName,
}: {
  open: boolean;
  onClose: () => void;
  id: string;
  initialName: string;
}) {
  const [name, setName] = useState(initialName ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // モーダルが開いたら初期値を反映＆フォーカス
    setName(initialName ?? "");
    if (open) {
      // 少し遅らせてからフォーカス
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, initialName]);

  const canSubmit = !!id && name.trim().length > 0 && name.trim() !== (initialName ?? "").trim();

  const [mutate, { loading, error }] = useMutation(UPDATE_ITEM, {
    variables: { input: { id, name: name.trim() } },
    onCompleted() {
      window.dispatchEvent(new CustomEvent("item-renamed", { detail: { id, name: name.trim() } }));
      onClose();
    },
  });

  if (!open) return null;

  // ★ DeleteItemModal と同じ "確実に前面" の描画方式
  return createPortal(
    <div style={backdrop} role="dialog" aria-modal="true" aria-labelledby="ren-title" onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 id="ren-title" style={title}>名前を変更</h3>

        <label style={field}>
          <span style={label}>新しい名前</span>
          <input
            ref={inputRef}
            style={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit && !loading) {
                e.preventDefault();
                mutate().catch(() => {});
              }
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder="名称を入力"
          />
        </label>

        {error ? <p style={errorStyle}>更新に失敗しました</p> : null}

        <div style={actions}>
          <button style={btnGhost} onClick={onClose} disabled={loading}>キャンセル</button>
          <button
            style={btnPrimary}
            onClick={() => mutate().catch(() => {})}
            disabled={!canSubmit || loading}
          >
            {loading ? "変更中..." : "変更"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ===== inline styles (DeleteItemModal に合わせた値) =====
const backdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.35)",
  display: "grid",
  placeItems: "center",
  zIndex: 1000,
};
const modal: React.CSSProperties = {
  width: "min(460px, 92vw)",
  background: "#fff",
  borderRadius: 12,
  padding: "16px 16px 12px",
  boxShadow: "0 12px 28px rgba(0,0,0,.18)",
};
const title: React.CSSProperties = { margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#111827" };
const field: React.CSSProperties = { display: "grid", gap: 6, marginBottom: 12 };
const label: React.CSSProperties = { fontSize: 12, color: "#6b7280" };
const input: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
  fontSize: 14,
  outline: "none",
};
const errorStyle: React.CSSProperties = { margin: "0 0 8px", color: "#b91c1c", fontSize: 12 };
const actions: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 8 };
const btnGhost: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
};
const btnPrimary: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};
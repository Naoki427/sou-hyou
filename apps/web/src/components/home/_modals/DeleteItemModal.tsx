"use client";
import { gql, useMutation } from "@apollo/client";
import React from "react";
import { createPortal } from "react-dom";

const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id) {
      success
      deletedId
    }
  }
`;

export function DeleteItemModal({
  open,
  onClose,
  id,
  name,
}: {
  open: boolean;
  onClose: () => void;
  id: string;
  name?: string;
}) {
  const [mutate, { loading }] = useMutation(DELETE_ITEM, {
    variables: { id },
    update(cache, { data }) {
      const deletedId = data?.deleteItem?.deletedId;
      if (deletedId) {
        cache.evict({ id: cache.identify({ __typename: "Item", id: deletedId }) });
        cache.gc();
      }
    },
    onCompleted() {
      window.dispatchEvent(new CustomEvent("item-deleted", { detail: { id } }));
      onClose();
    },
  });

  if (!open) return null;

  // ★ CreateMemoModal と同じ “確実に前面” の描画方式
  return createPortal(
    <div style={backdrop} role="dialog" aria-modal="true" aria-labelledby="del-title" onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 id="del-title" style={title}>本当に削除しますか？</h3>
        <p style={desc}>
          {name ? <>「{name}」を削除します。</> : null}
          この操作は取り消せません。
        </p>
        <div style={actions}>
          <button style={btnGhost} onClick={onClose} disabled={loading}>キャンセル</button>
          <button
            style={btnDanger}
            onClick={() => mutate().catch(() => {})}
            disabled={loading || !id}
          >
            {loading ? "削除中..." : "削除"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ===== inline styles (CreateMemoModal に合わせた値) =====
const backdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.35)",
  display: "grid",
  placeItems: "center",
  zIndex: 1000,
};
const modal: React.CSSProperties = {
  width: "min(420px, 92vw)",
  background: "#fff",
  borderRadius: 12,
  padding: "16px 16px 12px",
  boxShadow: "0 12px 28px rgba(0,0,0,.18)",
};
const title: React.CSSProperties = { margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#111827" };
const desc: React.CSSProperties = { margin: "0 0 14px", fontSize: 13, color: "#374151" };
const actions: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 8 };
const btnGhost: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
};
const btnDanger: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #dc2626",
  background: "#dc2626",
  color: "#fff",
  cursor: "pointer",
};

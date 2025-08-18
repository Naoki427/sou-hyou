// apps/web/src/components/memo/_modals/AddFieldModal.tsx
"use client";
import { useState } from "react";
import { FieldType } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (label: string, type: FieldType) => void | Promise<void>;
};

export function AddFieldModal({ open, onClose, onSubmit }: Props) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FieldType>("COMMENT");
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const trimmed = label.trim();
    if (!trimmed) { setErr("ラベルは必須です"); return; }
    try {
      await onSubmit(trimmed, type);
      setLabel("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "追加に失敗しました");
    }
  };

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>フィールドを追加</h3>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={labelCss}>タイプ</span>
            <select value={type} onChange={(e) => setType(e.target.value as FieldType)} style={input}>
              <option value="NUMBER">数値</option>
              <option value="SELECT">選択</option>
              <option value="COMMENT">コメント</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={labelCss}>ラベル</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例: オッズ / 評価 / 総評"
              style={input}
            />
          </label>
          {err && <div style={{ color: "#c00", fontSize: 13 }}>{err}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnGhost}>キャンセル</button>
            <button type="submit" style={btnPrimary}>追加</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const backdrop: React.CSSProperties = { position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"grid", placeItems:"center", zIndex:1000 };
const modal: React.CSSProperties = { width:"min(92vw, 400px)", background:"#fff", borderRadius:12, boxShadow:"0 10px 30px rgba(0,0,0,.2)", padding:16 };
const input: React.CSSProperties = { padding:"8px 10px", borderRadius:8, border:"1px solid #ddd" };
const labelCss: React.CSSProperties = { fontSize:12, color:"#666" };
const btnPrimary: React.CSSProperties = { padding:"8px 12px", borderRadius:8, border:"1px solid #111", background:"#111", color:"#fff", cursor:"pointer" };
const btnGhost: React.CSSProperties = { padding:"8px 12px", borderRadius:8, border:"1px solid #ddd", background:"#fff", cursor:"pointer" };

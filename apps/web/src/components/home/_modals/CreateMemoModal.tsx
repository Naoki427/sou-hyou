"use client";
import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";

type PredictionMark =
  | "HONMEI"    // 本命
  | "TAIKOU"    // 対抗
  | "TANNANA"   // 単穴
  | "RENSHITA"  // 連下
  | "HOSHI"     // ☆
  | "CHUUI"     // 注意
  | "KESHI"     //消し
  | "MUZIRUSHI"; // 無印

const DEFAULT_MARK: PredictionMark = "MUZIRUSHI";

const CREATE_MEMO = gql`
  mutation($input: CreateMemoInput!) {
    createMemo(input: $input) { id name path type }
  }
`;

type Props = {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  parentPath: string;
};

export function CreateMemoModal({ open, onClose, parentId, parentPath }: Props): React.JSX.Element | null {
  const router = useRouter();
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [headcount, setHeadcount] = useState<number>(18);
  const [createMemo, { loading }] = useMutation(CREATE_MEMO);

  if (!open) return null;

  const buildHorses = (n: number) =>
    Array.from({ length: n }, () => ({
      name: "",
      predictionMark: DEFAULT_MARK,
      fields: [] as Array<{ label: string; type: "NUMBER" | "SELECT" | "COMMENT"; value?: unknown }>,
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) return setErr("名前は必須です");
    if (headcount < 4 || headcount > 18) return setErr("頭数は 4〜18 の範囲で選択してください");

    try {
      const { data } = await createMemo({
        variables: { input: { name: name.trim(), parentId, horses: buildHorses(headcount) } },
      });
      const created = data?.createMemo;
      if (created?.path) {
        onClose();
        setName("");
        router.push(`/home${created.path}`);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "作成に失敗しました");
    }
  };

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>メモ作成</h3>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
          作成先: <code>{parentPath || "/"}</code>
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#555" }}>名前</span>
            <input
              autoFocus
              placeholder="例: 七夕賞"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={input}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#555" }}>頭数</span>
            <select
              aria-label="headcount"
              value={headcount}
              onChange={(e) => setHeadcount(parseInt(e.target.value, 10))}
              style={input}
            >
              {Array.from({ length: 15 }, (_, i) => i + 4).map((n) => (
                <option key={n} value={n}>
                  {n} 頭
                </option>
              ))}
            </select>
          </label>

          {err && <div style={{ color: "#c00", fontSize: 13 }}>{err}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnGhost}>キャンセル</button>
            <button disabled={loading} type="submit" style={btnPrimary}>
              {loading ? "作成中..." : "作成"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
  display: "grid", placeItems: "center", zIndex: 1000
};
const modal: React.CSSProperties = {
  width: "min(92vw, 420px)", background: "#fff", borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,.2)", padding: 16
};
const input: React.CSSProperties = {
  padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd"
};
const btnPrimary: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #222",
  background: "#222", color: "#fff", cursor: "pointer"
};
const btnGhost: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd",
  background: "#fff", cursor: "pointer"
};

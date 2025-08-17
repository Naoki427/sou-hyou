import { useEffect, useMemo, useState } from "react";
import { Horse } from "../types";

export function useTableColumns(horses: Horse[]) {
  const MIN_W = 96;   // 列の最小幅(px)
  const MAX_W = 560;  // 列の最大幅(px)
  
  const [nameColW, setNameColW] = useState<number>(160);       // 馬名列
  const [fieldColW, setFieldColW] = useState<number[]>([]);
  
  // 列の合成（fields[].label のユニーク順）
  const colLabels: string[] = useMemo(() => {
    const set = new Set<string>();
    horses.forEach((h) => (h.fields ?? []).forEach((f) => set.add(f.label)));
    return Array.from(set);
  }, [horses]);
  
  useEffect(() => {
    setFieldColW((prev) => {
      const next = [...prev];
      for (let i = 0; i < colLabels.length; i++) {
        if (next[i] == null) next[i] = 140;
      }
      return next.slice(0, colLabels.length);
    });
  }, [colLabels]);

  function startResize(
    e: React.MouseEvent,
    which: "name" | number
  ) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = which === "name" ? nameColW : fieldColW[which] ?? 140;

    const onMove = (ev: MouseEvent) => {
      const w = Math.max(MIN_W, Math.min(MAX_W, startW + (ev.clientX - startX)));
      if (which === "name") setNameColW(w);
      else setFieldColW((arr) => {
        const copy = [...arr];
        copy[which] = w;
        return copy;
      });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // グリッドテンプレートの生成
  const gridTemplate = [
    "56px",                            // 印
    "42px",                            // 番号
    `${nameColW}px`,                   // 馬名
    ...fieldColW.map((w) => `${w}px`)  // 可変列
  ].join(" ");

  return {
    colLabels,
    gridTemplate,
    startResize,
  };
}
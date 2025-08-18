import { useEffect, useMemo, useState } from "react";
import { Horse } from "../types";

export function useTableColumns(horses: Horse[]) {
  const MIN_W = 96;
  const MAX_W = 560;
  
  const [nameColW, setNameColW] = useState<number>(160);
  const [fieldColW, setFieldColW] = useState<number[]>([]);
  
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

  const gridTemplate = [
    "56px",
    "42px",
    `${nameColW}px`,
    ...fieldColW.map((w) => `${w}px`),
  ].join(" ");

  return {
    colLabels,
    gridTemplate,
    startResize,
  };
}
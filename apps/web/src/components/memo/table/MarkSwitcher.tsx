"use client";
import React, { useRef, useState } from "react";
import { PredictionMark, MARK_ORDER, MARK_LABEL } from "../types";

function nextMark(cur: PredictionMark, reverse = false): PredictionMark {
  const i = MARK_ORDER.indexOf(cur);
  if (i < 0) return "MUZIRUSHI";
  const n = MARK_ORDER.length;
  return MARK_ORDER[(i + (reverse ? n - 1 : 1)) % n];
}

type Props = {
  value: PredictionMark;
  onChange: (v: PredictionMark) => void;
};

export function MarkSwitcher({ value, onChange }: Props): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [longPressing, setLongPressing] = useState(false);
  const btnRef = useRef<HTMLButtonElement|null>(null);
  const timerRef = useRef<number|undefined>(undefined);

  // 長押しでメニューを変更できるように
  const onPointerDown = () => {
    setLongPressing(false);
    timerRef.current = window.setTimeout(() => {
      setLongPressing(true);
      setMenuOpen(true);
    }, 250);
  };
  
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };
  
  const onPointerUp = (e: React.PointerEvent) => {
    if (!longPressing) {
      const reverse = e.shiftKey || e.altKey;
      onChange(nextMark(value, reverse));
    }
    clearTimer();
  };

  // キー操作: Space/Enterで順送り、Shiftで逆
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(nextMark(value, e.shiftKey));
    }
    if (e.key === "Escape") setMenuOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={btnRef}
        type="button"
        aria-label="予想印を変更"
        title="クリック:順送り / Shift+クリック:逆送り / 長押し:一覧"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={clearTimer}
        onKeyDown={onKeyDown}
        style={{
          minWidth: 36,
          height: 32,
          border: "1px solid #ddd",
          borderRadius: 6,
          background: "#fff",
          cursor: "pointer",
          font: "inherit",
        }}
      >
        {MARK_LABEL[value]}
      </button>

      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10,
            }}
          />
          <div
            role="menu"
            style={{
              position: "absolute",
              zIndex: 11,
              top: "110%",
              left: 0,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              boxShadow: "0 10px 30px rgba(0,0,0,.12)",
              padding: 6,
              display: "grid",
              gridTemplateColumns: "repeat(4, 36px)",
              gap: 6,
            }}
          >
            {MARK_ORDER.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { onChange(m); setMenuOpen(false); }}
                title={m}
                style={{
                  width: 36,
                  height: 32,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background: value === m ? "#111827" : "#fff",
                  color: value === m ? "#fff" : "#111827",
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                {MARK_LABEL[m]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
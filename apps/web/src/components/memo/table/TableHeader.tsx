"use client";
import React from "react";
import { ResizeHandle } from "./ResizeHandle";
import { cell, row } from "./TableStyles";

type Props = {
  gridTemplate: string;
  colLabels: string[];
  onStartResize: (e: React.MouseEvent, which: "name" | number) => void;
};

export function TableHeader({ gridTemplate, colLabels, onStartResize }: Props): React.JSX.Element {
  return (
    <div style={{ ...row, gridTemplateColumns: gridTemplate, background: "#f9fafb" }}>
      <div style={{ ...cell(0), fontWeight: 600 }}>印</div>
      
      <div style={{ ...cell(1), fontWeight: 600, justifyContent: "center" }}>番</div>

      <div style={{ ...cell(2, colLabels.length === 0), position: "relative", fontWeight: 600 }}>
        名前
        <ResizeHandle onMouseDown={(e) => onStartResize(e, "name")} />
      </div>

      {colLabels.map((l, i) => {
        const isLastColumn = i === colLabels.length - 1;
        return (
          <div key={l} style={{ ...cell(i + 3, isLastColumn), position: "relative", fontWeight: 600 }}>
            {l}
            <ResizeHandle onMouseDown={(e) => onStartResize(e, i)} />
          </div>
        );
      })}
    </div>
  );
}
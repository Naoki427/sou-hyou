"use client";
import React from "react";

type Props = {
  onMouseDown: (e: React.MouseEvent) => void;
};

export function ResizeHandle({ onMouseDown }: Props): React.JSX.Element {
  return (
    <div
      onMouseDown={onMouseDown}
      title="ドラッグで列の幅を調整"
      style={{
        position: "absolute",
        top: 0,
        right: -3,
        width: 6,
        height: "100%",
        cursor: "col-resize",
        background: "rgba(0,0,0,0.04)"
      }}
    />
  );
}
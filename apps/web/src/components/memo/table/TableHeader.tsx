"use client";
import React, { useState } from "react";
import { ResizeHandle } from "./ResizeHandle";
import { cell, row } from "./TableStyles";
import { AddFieldModal } from "../_modals/AddFieldModal";
import { FieldType } from "../types";

type Props = {
  gridTemplate: string;
  colLabels: string[];
  onStartResize: (e: React.MouseEvent, which: "name" | number) => void;
  onAddField: (label: string, type: FieldType) => Promise<void>;
};

export function TableHeader({
  gridTemplate, colLabels, onStartResize, onAddField,
}: Props): React.JSX.Element {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <div style={{ ...row, gridTemplateColumns: gridTemplate, background: "#f9fafb" }}>
        <div style={{ ...cell(0), fontWeight: 600 }}>印</div>
        <div style={{ ...cell(1), fontWeight: 600, justifyContent: "center" }}>番</div>

        <div style={{ ...cell(2, colLabels.length === 0), position: "relative", fontWeight: 600 }}>
          名前
          <ResizeHandle onMouseDown={(e) => onStartResize(e, "name")} />
        </div>

        {colLabels.map((l, i) => {
          const isLast = i === colLabels.length - 1;
          return (
            <div key={l} style={{ ...cell(i + 3, isLast), position: "relative", fontWeight: 600 }}>
              {l}
              <ResizeHandle onMouseDown={(e) => onStartResize(e, i)} />
            </div>
          );
        })}
      </div>

      <AddFieldModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (label, type) => {
          await onAddField(label, type);
          setAddOpen(false);
        }}
      />
    </>
  );
}

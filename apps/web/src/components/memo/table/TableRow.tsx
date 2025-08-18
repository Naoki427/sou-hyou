"use client";
import React from "react";
import { Horse, FieldType, PredictionMark } from "../types";
import { MarkSwitcher } from "./MarkSwitcher";
import { EditableCell } from "./EditableCell";
import { cell, row } from "./TableStyles";

type Props = {
  horse: Horse;
  rowIndex: number;
  gridTemplate: string;
  colLabels: string[];
  onChangeMark: (value: PredictionMark) => void;
  onBlurName: (value: string) => void;
  onBlurField: (label: string, type: FieldType, value: string) => void;
  onFocusRow: (direction: "prev" | "next") => void;
  nameInputRef?: (el: HTMLInputElement | null) => void;
};

export function TableRow({
  horse,
  rowIndex,
  gridTemplate,
  colLabels,
  onChangeMark,
  onBlurName,
  onBlurField,
  onFocusRow,
  nameInputRef,
}: Props): React.JSX.Element {
  const findField = (label: string) =>
    (horse.fields ?? []).find((f) => f.label === label);

  const isEliminated = horse.predictionMark === "KESHI";
  const rowBgColor = isEliminated ? "rgba(0, 0, 0, 0.4)" : "transparent";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      const currentValue = e.currentTarget.value;
      onBlurName(currentValue);
      
      setTimeout(() => {
        if (e.shiftKey) onFocusRow("prev");
        else onFocusRow("next");
      }, 5);
    }
  };

  return (
    <div key={rowIndex} style={{ 
      ...row, 
      gridTemplateColumns: gridTemplate,
      backgroundColor: rowBgColor,
      transition: "background-color 0.2s ease"
    }}>
      {/* 印 */}
      <div style={cell(0)}>
        <MarkSwitcher
          value={(horse.predictionMark as PredictionMark) || "MUZIRUSHI"}
          onChange={onChangeMark}
        />
      </div>

      {/* 番号 */}
      <div style={{ ...cell(1), justifyContent: "center", fontSize: "14px", color: "#666" }}>
        {rowIndex + 1}
      </div>

      {/* 馬名（列幅に追従） */}
      <EditableCell
        index={2}
        isLast={colLabels.length === 0}
        value={horse.name || ""}
        type="COMMENT"
        onBlur={onBlurName}
        onKeyDown={handleKeyDown}
        inputRef={nameInputRef}
      />

      {/* 可変列 */}
      {colLabels.map((label, i) => {
        const f = findField(label);
        const type = (f?.type || "COMMENT") as FieldType;
        const val = f?.value ?? "";
        const isLastColumn = i === colLabels.length - 1;

        return (
          <EditableCell
            key={label}
            index={i + 3}
            isLast={isLastColumn}
            value={val}
            type={type}
            onBlur={(value) => onBlurField(label, type, value)}
          />
        );
      })}

      {/* addFieldButton用の空の列
      <div style={{ ...cell(colLabels.length + 3, true) }}></div> */}
    </div>
  );
}
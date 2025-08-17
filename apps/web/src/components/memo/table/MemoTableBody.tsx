"use client";
import React, { useRef, useCallback } from "react";
import { Horse, FieldType, PredictionMark } from "../types";
import { TableRow } from "./TableRow";

type Props = {
  horses: Horse[];
  gridTemplate: string;
  colLabels: string[];
  onChangeMark: (row: number, value: PredictionMark) => Promise<void>;
  onBlurName: (row: number, value: string) => Promise<void>;
  onBlurField: (row: number, label: string, type: FieldType, value: string) => Promise<void>;
};

export function MemoTableBody({
  horses,
  gridTemplate,
  colLabels,
  onChangeMark,
  onBlurName,
  onBlurField,
}: Props): React.JSX.Element {
  const nameRefs = useRef<Array<HTMLInputElement | null>>([]);
  const focusTimeoutRef = useRef<number | null>(null);

  const focusRow = useCallback((row: number) => {
    if (row < 0 || row >= horses.length) return;
    
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    
    focusTimeoutRef.current = window.setTimeout(() => {
      nameRefs.current[row]?.focus();
      nameRefs.current[row]?.select?.();
      focusTimeoutRef.current = null;
    }, 10);
  }, [horses.length]);

  React.useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {horses.map((horse, r) => (
        <TableRow
          key={r}
          horse={horse}
          rowIndex={r}
          gridTemplate={gridTemplate}
          colLabels={colLabels}
          onChangeMark={(value) => onChangeMark(r, value)}
          onBlurName={(value) => onBlurName(r, value)}
          onBlurField={(label, type, value) => onBlurField(r, label, type, value)}
          onFocusRow={(direction) => {
            const targetRow = direction === "prev" ? r - 1 : r + 1;
            focusRow(targetRow);
          }}
          nameInputRef={(el) => (nameRefs.current[r] = el)}
        />
      ))}
    </>
  );
}
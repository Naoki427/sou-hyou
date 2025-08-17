"use client";
import React from "react";
import { Horse, FieldType, PredictionMark } from "../types";
import { useTableColumns } from "./useTableColumns";
import { TableHeader } from "./TableHeader";
import { MemoTableBody } from "./MemoTableBody";
import { sheet, focusStyle } from "./TableStyles";

type Props = {
  horses: Horse[];
  onChangeMark: (row: number, value: PredictionMark) => Promise<void>;
  onBlurName: (row: number, value: string) => Promise<void>;
  onBlurField: (row: number, label: string, type: FieldType, value: string) => Promise<void>;
};

export function MemoTable({ horses, onChangeMark, onBlurName, onBlurField }: Props): React.JSX.Element {
  const { colLabels, gridTemplate, startResize } = useTableColumns(horses);

  return (
    <>
      <style>{focusStyle}</style>
      <div style={{ overflowX: "auto", width: "fit-content" }}>
        <div style={sheet}>
          <TableHeader
            gridTemplate={gridTemplate}
            colLabels={colLabels}
            onStartResize={startResize}
          />
          <MemoTableBody
            horses={horses}
            gridTemplate={gridTemplate}
            colLabels={colLabels}
            onChangeMark={onChangeMark}
            onBlurName={onBlurName}
            onBlurField={onBlurField}
          />
        </div>
      </div>
    </>
  );
}
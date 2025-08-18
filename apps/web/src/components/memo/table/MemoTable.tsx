// apps/web/src/components/memo/table/MemoTable.tsx
"use client";
import React, { useState } from "react";
import { Horse, FieldType, PredictionMark } from "../types";
import { useTableColumns } from "./useTableColumns";
import { TableHeader } from "./TableHeader";
import { MemoTableBody } from "./MemoTableBody";
import { sheet, focusStyle } from "./TableStyles";
import { AddFieldButton } from "./AddFieldButton";
import { AddFieldModal } from "../_modals/AddFieldModal";

type Props = {
  horses: Horse[];
  onChangeMark: (row: number, value: PredictionMark) => Promise<void>;
  onBlurName:   (row: number, value: string) => Promise<void>;
  onBlurField:  (row: number, label: string, type: FieldType, value: string) => Promise<void>;
  onAddField:   (label: string, type: FieldType) => Promise<void>; // ← ヘッダー用
};

export function MemoTable({
  horses, onChangeMark, onBlurName, onBlurField, onAddField,
}: Props): React.JSX.Element {
  const { colLabels, gridTemplate, startResize } = useTableColumns(horses);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <style>{focusStyle}</style>

      {/* 横スクロールの中で “表＋サイドボタン” を横並びにする */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "inline-flex", alignItems: "stretch" }}>
          {/* 表本体 */}
          <div style={sheet}>
            <TableHeader
              gridTemplate={gridTemplate}
              colLabels={colLabels}
              onStartResize={startResize}
              onAddField={onAddField}
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

          {/* サイドの“分離された”＋ボタン（最後の列の右横に見える） */}
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            paddingLeft: 8,
            paddingTop: 4,
          }}>
            <AddFieldButton onClick={() => setAddOpen(true)} />
          </div>
        </div>
      </div>

      {/* 追加モーダル（GraphQLは親から渡された onAddField を呼ぶ） */}
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

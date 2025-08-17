"use client";
import React from "react";
import { FieldType } from "../types";
import { editableCell, input } from "./TableStyles";

type Props = {
  index: number;
  isLast?: boolean;
  value: string | number | null;
  type: FieldType;
  placeholder?: string;
  onBlur: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
};

export function EditableCell({
  index,
  isLast = false,
  value,
  type,
  placeholder,
  onBlur,
  onKeyDown,
  inputRef,
}: Props): React.JSX.Element {
  const displayValue = value === null ? "" : String(value);
  const lastValueRef = React.useRef<string>(displayValue);
  
  // 値の重複を防ぐためのblurハンドラー
  const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    
    // 値が変更されていない場合は処理をスキップ
    if (currentValue === lastValueRef.current) {
      return;
    }
    
    lastValueRef.current = currentValue;
    onBlur(currentValue);
  }, [onBlur]);
  
  // displayValueが変更されたときにlastValueRefを更新
  React.useEffect(() => {
    lastValueRef.current = displayValue;
  }, [displayValue]);
  
  return (
    <div className="editable-cell" style={editableCell(index, isLast)}>
      <input
        ref={inputRef}
        inputMode={type === "NUMBER" ? "decimal" : undefined}
        defaultValue={displayValue}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={input}
      />
    </div>
  );
}
import React from "react";

export const sheet: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  overflow: "hidden",
  background: "#fff",
};

export const row: React.CSSProperties = {
  display: "grid",
  // gridTemplateColumns は行ごとに上で可変設定
};

export const cell = (index: number, isLast = false): React.CSSProperties => ({
  padding: "4px 8px",
  borderTop: "1px solid #e5e7eb",
  borderLeft: index === 0 ? "none" : "1px solid #e5e7eb",
  borderRight: isLast ? "1px solid #e5e7eb" : "none",
  display: "flex",
  alignItems: "center",
  minHeight: "32px",
});

export const input: React.CSSProperties = {
  border: "none",
  outline: "none",
  background: "transparent",
  width: "100%",
  font: "inherit",
  minWidth: 0,
  padding: "2px 0",
};

export const editableCell = (index: number, isLast = false): React.CSSProperties => ({
  ...cell(index, isLast),
  cursor: "text",
  transition: "background-color 0.1s ease",
});

// フォーカス時のスタイル用CSS
export const focusStyle = `
  .editable-cell:hover {
    background-color: #f8fafc;
  }
  .editable-cell:focus-within {
    background-color: #f1f5f9;
    box-shadow: inset 0 0 0 1px #3b82f6;
  }
`;
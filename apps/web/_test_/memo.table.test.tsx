// apps/web/_test_/memo.table.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoTable } from "@/components/memo/table/MemoTable";
import type { Horse, FieldType } from "@/components/memo/types";

const mockHorses: Horse[] = [
  {
    name: "テストホース1",
    predictionMark: "HONMEI",
    fields: [
      { label: "オッズ", type: "NUMBER", value: 2.5 },
      { label: "コメント", type: "COMMENT", value: "期待大" },
    ],
  },
  {
    name: "テストホース2",
    predictionMark: "KESHI",
    fields: [
      { label: "オッズ", type: "NUMBER", value: 10.0 },
      { label: "コメント", type: "COMMENT", value: "微妙" },
    ],
  },
  {
    name: "テストホース3",
    predictionMark: "TAIKOU",
    fields: [{ label: "オッズ", type: "NUMBER", value: 5.0 }],
  },
];

describe("MemoTable", () => {
  const mockOnChangeMark = vi.fn();
  const mockOnBlurName = vi.fn();
  const mockOnBlurField = vi.fn();
  const mockOnAddField = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderTable = (horses: Horse[] = mockHorses) =>
    render(
      <MemoTable
        horses={horses}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
        onAddField={mockOnAddField}
      />
    );

  it("ヘッダーとデータ行を正しく表示", () => {
    renderTable();
    expect(screen.getByText("印")).toBeInTheDocument();
    expect(screen.getByText("番")).toBeInTheDocument();
    expect(screen.getByText("名前")).toBeInTheDocument();
    expect(screen.getByText("オッズ")).toBeInTheDocument();
    expect(screen.getByText("コメント")).toBeInTheDocument();

    expect(screen.getByDisplayValue("テストホース1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("テストホース2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("テストホース3")).toBeInTheDocument();

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByDisplayValue("2.5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("期待大")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument(); // 10.0 -> "10"
    expect(screen.getByDisplayValue("微妙")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument(); // 5.0 -> "5"
  });

  it("予想印のシンボルを描画（◎/消/◯）", () => {
    renderTable();
    expect(screen.getByText("◎")).toBeInTheDocument(); // HONMEI
    expect(screen.getByText("消")).toBeInTheDocument(); // KESHI
    expect(screen.getByText("◯")).toBeInTheDocument(); // TAIKOU
  });

  it("馬名の編集で onBlurName が呼ばれる", () => {
    renderTable();
    const nameInput = screen.getByDisplayValue("テストホース1");
    fireEvent.change(nameInput, { target: { value: "新しい馬名" } });
    fireEvent.blur(nameInput);
    expect(mockOnBlurName).toHaveBeenCalledWith(0, "新しい馬名");
  });

  it("フィールド編集で onBlurField が呼ばれる", () => {
    renderTable();
    const oddsInput = screen.getByDisplayValue("2.5");
    fireEvent.change(oddsInput, { target: { value: "3.0" } });
    fireEvent.blur(oddsInput);
    expect(mockOnBlurField).toHaveBeenCalledWith(0, "オッズ", "NUMBER", "3.0");
  });

  it("空の馬リストでもヘッダーは表示される", () => {
    renderTable([]);
    expect(screen.getByText("印")).toBeInTheDocument();
    expect(screen.getByText("番")).toBeInTheDocument();
    expect(screen.getByText("名前")).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("フィールドが無い馬でも表示される", () => {
    renderTable([{ name: "シンプル馬", predictionMark: "MUZIRUSHI", fields: [] }]);
    expect(screen.getByDisplayValue("シンプル馬")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    // MUZIRUSHI は空表示なので、ボタン存在で確認
    expect(screen.getByRole("button", { name: "予想印を変更" })).toBeInTheDocument();
  });

  it("Enter / Shift+Enter で移動（blur も発火して検証）", () => {
    renderTable();

    const first = screen.getByDisplayValue("テストホース1");
    fireEvent.keyDown(first, { key: "Enter" });
    fireEvent.blur(first);
    expect(mockOnBlurName).toHaveBeenCalledWith(0, "テストホース1");

    const second = screen.getByDisplayValue("テストホース2");
    fireEvent.keyDown(second, { key: "Enter", shiftKey: true });
    fireEvent.blur(second);
    expect(mockOnBlurName).toHaveBeenCalledWith(1, "テストホース2");
  });

  it("右横の＋ボタン→モーダル→追加で onAddField が呼ばれる", () => {
    renderTable();

    // 右横の「フィールド」ボタン（AddFieldButton）
    const addBtn = screen.getByRole("button", { name: /フィールド/i });
    fireEvent.click(addBtn);

    // モーダル内：タイプ＆ラベル入力
    const select = screen.getByLabelText("タイプ");
    fireEvent.change(select, { target: { value: "NUMBER" } });

    const labelInput = screen.getByLabelText("ラベル");
    fireEvent.change(labelInput, { target: { value: "脚質" } });

    // 追加
    const submit = screen.getByRole("button", { name: "追加" });
    fireEvent.click(submit);

    expect(mockOnAddField).toHaveBeenCalledWith("脚質", "NUMBER");
  });
});

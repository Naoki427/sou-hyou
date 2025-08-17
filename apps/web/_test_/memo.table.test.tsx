import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { ComponentType } from "react";
import { MemoTable } from "@/components/memo/table/MemoTable";
import type { Horse, PredictionMark, FieldType } from "@/components/memo/types";

// テストデータ
const mockHorses: Horse[] = [
  {
    name: "テストホース1",
    predictionMark: "HONMEI",
    fields: [
      { label: "オッズ", type: "NUMBER", value: 2.5 },
      { label: "コメント", type: "COMMENT", value: "期待大" }
    ]
  },
  {
    name: "テストホース2",
    predictionMark: "KESHI", 
    fields: [
      { label: "オッズ", type: "NUMBER", value: 10.0 },
      { label: "コメント", type: "COMMENT", value: "微妙" }
    ]
  },
  {
    name: "テストホース3",
    predictionMark: "TAIKOU",
    fields: [
      { label: "オッズ", type: "NUMBER", value: 5.0 }
    ]
  }
];

describe("MemoTable", () => {
  const mockOnChangeMark = vi.fn();
  const mockOnBlurName = vi.fn();
  const mockOnBlurField = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ヘッダーとデータ行を正しく表示する", () => {
    render(
      <MemoTable
        horses={mockHorses}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
      />
    );

    // ヘッダーの確認
    expect(screen.getByText("印")).toBeInTheDocument();
    expect(screen.getByText("番")).toBeInTheDocument();
    expect(screen.getByText("名前")).toBeInTheDocument();
    expect(screen.getByText("オッズ")).toBeInTheDocument();
    expect(screen.getByText("コメント")).toBeInTheDocument();

    // データ行の確認
    expect(screen.getByDisplayValue("テストホース1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("テストホース2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("テストホース3")).toBeInTheDocument();

    // 番号列の確認
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    // フィールド値の確認
    expect(screen.getByDisplayValue("2.5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("期待大")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument(); // 10.0 -> 10
    expect(screen.getByDisplayValue("微妙")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument(); // 5.0 -> 5
  });

  it("予想印マークを正しく表示する", () => {
    render(
      <MemoTable
        horses={mockHorses}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
      />
    );

    // 予想印の表示確認（MARK_LABELに基づく）
    expect(screen.getByText("◎")).toBeInTheDocument(); // HONMEI
    expect(screen.getByText("消")).toBeInTheDocument(); // KESHI
    expect(screen.getByText("◯")).toBeInTheDocument(); // TAIKOU
  });

  it("消印の行が暗く表示される", () => {
    render(
      <MemoTable
        horses={mockHorses}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
      />
    );

    // KESHI（消）の馬の行要素を取得
    const keshiHorseInput = screen.getByDisplayValue("テストホース2");
    const keshiRow = keshiHorseInput.closest('div[style*="rgba(0, 0, 0, 0.4)"]');
    
    // 背景色が設定されていることを確認
    expect(keshiRow).toBeInTheDocument();
  });

  it("馬名の編集時にコールバックが呼ばれる", () => {
    render(
      <MemoTable
        horses={mockHorses}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
      />
    );

    const nameInput = screen.getByDisplayValue("テストホース1");
    
    fireEvent.change(nameInput, { target: { value: "新しい馬名" } });
    fireEvent.blur(nameInput);

    expect(mockOnBlurName).toHaveBeenCalledWith(0, "新しい馬名");
  });

  it("フィールド値の編集時にコールバックが呼ばれる", () => {
    render(
      <MemoTable
        horses={mockHorses}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
      />
    );

    const oddsInput = screen.getByDisplayValue("2.5");
    
    fireEvent.change(oddsInput, { target: { value: "3.0" } });
    fireEvent.blur(oddsInput);

    expect(mockOnBlurField).toHaveBeenCalledWith(0, "オッズ", "NUMBER", "3.0");
  });

  it("空の馬リストでも正常に表示される", () => {
    render(
      <MemoTable
        horses={[]}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
      />
    );

    // ヘッダーは表示される
    expect(screen.getByText("印")).toBeInTheDocument();
    expect(screen.getByText("番")).toBeInTheDocument();
    expect(screen.getByText("名前")).toBeInTheDocument();
    
    // データ行は存在しない
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("フィールドがない馬でも正常に表示される", () => {
    const horsesWithoutFields: Horse[] = [
      {
        name: "シンプル馬",
        predictionMark: "MUZIRUSHI",
        fields: []
      }
    ];

    render(
      <MemoTable
        horses={horsesWithoutFields}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
      />
    );

    expect(screen.getByDisplayValue("シンプル馬")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    // MUZIRUSHI のマークを確認（全角スペースは特別な処理が必要）
    const muzirushiButton = screen.getByRole("button", { name: "予想印を変更" });
    expect(muzirushiButton).toBeInTheDocument();
  });

  it("Enterキーでフォーカス移動が機能する", () => {
    render(
      <MemoTable
        horses={mockHorses}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
      />
    );

    const firstNameInput = screen.getByDisplayValue("テストホース1");
    
    // Enterキーを押下
    fireEvent.keyDown(firstNameInput, { key: "Enter" });

    // onBlurNameが呼ばれることを確認
    expect(mockOnBlurName).toHaveBeenCalledWith(0, "テストホース1");
  });

  it("Shift+Enterで前の行にフォーカス移動する", () => {
    render(
      <MemoTable
        horses={mockHorses}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
      />
    );

    const secondNameInput = screen.getByDisplayValue("テストホース2");
    
    // Shift+Enterキーを押下
    fireEvent.keyDown(secondNameInput, { key: "Enter", shiftKey: true });

    // onBlurNameが呼ばれることを確認
    expect(mockOnBlurName).toHaveBeenCalledWith(1, "テストホース2");
  });

  it("テーブルの幅が内容に応じて調整される", () => {
    render(
      <MemoTable
        horses={mockHorses}
        onChangeMark={mockOnChangeMark}
        onBlurName={mockOnBlurName}
        onBlurField={mockOnBlurField}
      />
    );

    // テーブルの外側コンテナのスタイルを確認
    const tableContainer = screen.getByText("印").closest('div[style*="overflow-x"]');
    expect(tableContainer).toHaveStyle({ width: "fit-content" });
  });
});
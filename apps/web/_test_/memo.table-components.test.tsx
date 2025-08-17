import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TableRow } from "@/components/memo/table/TableRow";
import { EditableCell } from "@/components/memo/table/EditableCell";
import { MarkSwitcher } from "@/components/memo/table/MarkSwitcher";
import { TableHeader } from "@/components/memo/table/TableHeader";
import type { Horse, PredictionMark, FieldType } from "@/components/memo/types";

describe("TableRow", () => {
  const mockHorse: Horse = {
    name: "テストホース",
    predictionMark: "HONMEI",
    fields: [
      { label: "オッズ", type: "NUMBER", value: 2.5 },
      { label: "コメント", type: "COMMENT", value: "期待" }
    ]
  };

  const mockProps = {
    horse: mockHorse,
    rowIndex: 0,
    gridTemplate: "56px 56px 200px 100px 150px",
    colLabels: ["オッズ", "コメント"],
    onChangeMark: vi.fn(),
    onBlurName: vi.fn(),
    onBlurField: vi.fn(),
    onFocusRow: vi.fn(),
    nameInputRef: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("通常の行を正しく表示する", () => {
    render(<TableRow {...mockProps} />);

    expect(screen.getByDisplayValue("テストホース")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // rowIndex + 1
    expect(screen.getByDisplayValue("2.5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("期待")).toBeInTheDocument();
    expect(screen.getByText("◎")).toBeInTheDocument(); // HONMEI
  });

  it("KESHI（消）の馬の行が暗く表示される", () => {
    const keshiHorse = { ...mockHorse, predictionMark: "KESHI" as PredictionMark };
    const props = { ...mockProps, horse: keshiHorse };

    render(<TableRow {...props} />);

    // KESHI の場合、背景色が設定されている div を探す
    const row = screen.getByDisplayValue("テストホース").closest('div[style*="rgba(0, 0, 0, 0.4)"]');
    expect(row).toBeInTheDocument();
  });

  it("Enterキーで次の行にフォーカス移動する", async () => {
    render(<TableRow {...mockProps} />);

    const nameInput = screen.getByDisplayValue("テストホース");
    fireEvent.keyDown(nameInput, { key: "Enter" });

    expect(mockProps.onBlurName).toHaveBeenCalledWith("テストホース");
    
    // setTimeoutを待つ
    await waitFor(() => {
      expect(mockProps.onFocusRow).toHaveBeenCalledWith("next");
    }, { timeout: 100 });
  });

  it("Shift+Enterキーで前の行にフォーカス移動する", async () => {
    render(<TableRow {...mockProps} />);

    const nameInput = screen.getByDisplayValue("テストホース");
    fireEvent.keyDown(nameInput, { key: "Enter", shiftKey: true });

    expect(mockProps.onBlurName).toHaveBeenCalledWith("テストホース");
    
    // setTimeoutを待つ
    await waitFor(() => {
      expect(mockProps.onFocusRow).toHaveBeenCalledWith("prev");
    }, { timeout: 100 });
  });

  it("フィールドがない馬でも正常に表示される", () => {
    const horseWithoutFields = { ...mockHorse, fields: [] };
    const props = { ...mockProps, horse: horseWithoutFields, colLabels: [] };

    render(<TableRow {...props} />);

    expect(screen.getByDisplayValue("テストホース")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});

describe("EditableCell", () => {
  const mockProps = {
    index: 0,
    value: "テスト値",
    type: "COMMENT" as FieldType,
    onBlur: vi.fn(),
    onKeyDown: vi.fn(),
    inputRef: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("値を正しく表示する", () => {
    render(<EditableCell {...mockProps} />);
    expect(screen.getByDisplayValue("テスト値")).toBeInTheDocument();
  });

  it("null値を空文字として表示する", () => {
    const props = { ...mockProps, value: null };
    render(<EditableCell {...props} />);
    
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("");
  });

  it("数値型の場合にinputModeがdecimalになる", () => {
    const props = { ...mockProps, type: "NUMBER" as FieldType, value: 123 };
    render(<EditableCell {...props} />);
    
    const input = screen.getByDisplayValue("123");
    expect(input).toHaveAttribute("inputmode", "decimal");
  });

  it("プレースホルダーが正しく表示される", () => {
    const props = { ...mockProps, value: "", placeholder: "入力してください" };
    render(<EditableCell {...props} />);
    
    expect(screen.getByPlaceholderText("入力してください")).toBeInTheDocument();
  });

  it("値が変更された時のみonBlurが呼ばれる", () => {
    render(<EditableCell {...mockProps} />);
    
    const input = screen.getByDisplayValue("テスト値");
    
    // 同じ値でblur - 呼ばれない
    fireEvent.blur(input);
    expect(mockProps.onBlur).not.toHaveBeenCalled();
    
    // 値を変更してblur - 呼ばれる
    fireEvent.change(input, { target: { value: "新しい値" } });
    fireEvent.blur(input);
    expect(mockProps.onBlur).toHaveBeenCalledWith("新しい値");
  });

  it("onKeyDownが呼ばれる", () => {
    render(<EditableCell {...mockProps} />);
    
    const input = screen.getByDisplayValue("テスト値");
    fireEvent.keyDown(input, { key: "Enter" });
    
    expect(mockProps.onKeyDown).toHaveBeenCalled();
  });
});

describe("MarkSwitcher", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("現在の予想印を表示する", () => {
    render(<MarkSwitcher value="HONMEI" onChange={mockOnChange} />);
    expect(screen.getByText("◎")).toBeInTheDocument();
  });

  it("クリックで予想印が変更される", () => {
    render(<MarkSwitcher value="MUZIRUSHI" onChange={mockOnChange} />);
    
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button);
    fireEvent.pointerUp(button);
    
    // 次の予想印（HONMEI）に変更される
    expect(mockOnChange).toHaveBeenCalledWith("HONMEI");
  });

  it("最後の予想印から最初に戻る", () => {
    render(<MarkSwitcher value="KESHI" onChange={mockOnChange} />);
    
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button);
    fireEvent.pointerUp(button);
    
    // 最初の予想印（MUZIRUSHI）に戻る
    expect(mockOnChange).toHaveBeenCalledWith("MUZIRUSHI");
  });
});

describe("TableHeader", () => {
  const mockProps = {
    gridTemplate: "56px 56px 200px 100px 150px",
    colLabels: ["オッズ", "コメント"],
    onStartResize: vi.fn()
  };

  it("ヘッダーを正しく表示する", () => {
    render(<TableHeader {...mockProps} />);

    expect(screen.getByText("印")).toBeInTheDocument();
    expect(screen.getByText("番")).toBeInTheDocument(); // "番号"ではなく"番"
    expect(screen.getByText("名前")).toBeInTheDocument(); // "馬名"ではなく"名前"
    expect(screen.getByText("オッズ")).toBeInTheDocument();
    expect(screen.getByText("コメント")).toBeInTheDocument();
  });

  it("列ラベルがない場合も正常に表示される", () => {
    const props = { ...mockProps, colLabels: [], gridTemplate: "56px 56px 200px" };
    render(<TableHeader {...props} />);

    expect(screen.getByText("印")).toBeInTheDocument();
    expect(screen.getByText("番")).toBeInTheDocument();
    expect(screen.getByText("名前")).toBeInTheDocument();
    expect(screen.queryByText("オッズ")).not.toBeInTheDocument();
  });

  it("リサイズハンドルが表示される", () => {
    render(<TableHeader {...mockProps} />);

    // リサイズハンドルの要素をtitleで確認
    const resizeHandles = screen.getAllByTitle("ドラッグで列の幅を調整");
    expect(resizeHandles.length).toBe(3); // 名前列 + 2つのフィールド列
  });
});
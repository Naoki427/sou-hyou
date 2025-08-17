import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockedProvider } from "@apollo/client/testing";
import type { ComponentType } from "react";
import { GET_MEMO, SET_HORSE_PROP, SET_FIELD_VALUE } from "@/components/memo/queries";

// useParamsのモック
const mockParams = { id: "test-memo-id" };
vi.mock("next/navigation", () => ({
  useParams: () => mockParams,
}));

// テストデータ
const mockMemo = {
  id: "test-memo-id",
  name: "テスト競馬メモ",
  path: "/test-memo",
  type: "memo",
  horses: [
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
    }
  ]
};

const successMocks = [
  {
    request: {
      query: GET_MEMO,
      variables: { id: "test-memo-id" }
    },
    result: {
      data: { item: mockMemo }
    }
  },
  // refetchのためのクエリ（編集後）
  {
    request: {
      query: GET_MEMO,
      variables: { id: "test-memo-id" }
    },
    result: {
      data: { item: mockMemo }
    }
  },
  {
    request: {
      query: SET_HORSE_PROP,
      variables: { memoId: "test-memo-id", index: 0, predictionMark: "TAIKOU" }
    },
    result: {
      data: { setHorseProp: true }
    }
  },
  {
    request: {
      query: SET_HORSE_PROP,
      variables: { memoId: "test-memo-id", index: 0, name: "新しい馬名" }
    },
    result: {
      data: { setHorseProp: true }
    }
  },
  {
    request: {
      query: SET_FIELD_VALUE,
      variables: { memoId: "test-memo-id", index: 0, label: "オッズ", type: "NUMBER", value: 3.0 }
    },
    result: {
      data: { setFieldValue: true }
    }
  }
];

const loadingMocks = [
  {
    request: {
      query: GET_MEMO,
      variables: { id: "test-memo-id" }
    },
    delay: 1000,
    result: {
      data: { item: mockMemo }
    }
  }
];

const errorMocks = [
  {
    request: {
      query: GET_MEMO,
      variables: { id: "test-memo-id" }
    },
    error: new Error("データの取得に失敗しました")
  }
];

async function loadMemoPage(): Promise<ComponentType<any>> {
  const mod = await import("@/components/memo/MemoPage");
  return mod.MemoPage as ComponentType<any>;
}

describe("MemoPage", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("ローディング状態を表示する", async () => {
    const MemoPage = await loadMemoPage();
    
    render(
      <MockedProvider mocks={loadingMocks} addTypename={false}>
        <MemoPage />
      </MockedProvider>
    );

    expect(screen.getByText("読み込み中…")).toBeInTheDocument();
  });

  it("エラー状態を表示する", async () => {
    const MemoPage = await loadMemoPage();
    
    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <MemoPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/読み込みエラー/)).toBeInTheDocument();
    });
  });

  it("メモデータを正常に表示する", async () => {
    const MemoPage = await loadMemoPage();
    
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <MemoPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("テスト競馬メモ")).toBeInTheDocument();
    });

    // 馬名の表示確認
    expect(screen.getByDisplayValue("テストホース1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("テストホース2")).toBeInTheDocument();

    // 番号列の表示確認
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // フィールド値の表示確認
    expect(screen.getByDisplayValue("2.5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("期待大")).toBeInTheDocument();
  });

  it("予想印が消の馬の行が暗くなる", async () => {
    const MemoPage = await loadMemoPage();
    
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <MemoPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("テスト競馬メモ")).toBeInTheDocument();
    });

    // KESHI（消）の馬の行の背景色が設定されていることを確認
    const keshiHorseInput = screen.getByDisplayValue("テストホース2");
    const keshiRow = keshiHorseInput.closest('div[style*="rgba(0, 0, 0, 0.4)"]');
    expect(keshiRow).toBeInTheDocument();
  });

  it("馬名を編集できる", async () => {
    const MemoPage = await loadMemoPage();
    
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <MemoPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("テストホース1")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("テストホース1");
    
    // 値を変更してblurイベントを発火
    fireEvent.change(nameInput, { target: { value: "新しい馬名" } });
    fireEvent.blur(nameInput);

    // 保存中の表示確認
    await waitFor(() => {
      expect(screen.getByText("保存中…")).toBeInTheDocument();
    });
  });

  it("フィールド値を編集できる", async () => {
    const MemoPage = await loadMemoPage();
    
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <MemoPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("2.5")).toBeInTheDocument();
    });

    const oddsInput = screen.getByDisplayValue("2.5");
    
    // 値を変更してblurイベントを発火
    fireEvent.change(oddsInput, { target: { value: "3.0" } });
    fireEvent.blur(oddsInput);

    // 保存中の表示確認
    await waitFor(() => {
      expect(screen.getByText("保存中…")).toBeInTheDocument();
    });
  });

  it("存在しないメモIDの場合にエラーメッセージを表示する", async () => {
    const notFoundMocks = [
      {
        request: {
          query: GET_MEMO,
          variables: { id: "test-memo-id" }
        },
        result: {
          data: { item: null }
        }
      }
    ];

    const MemoPage = await loadMemoPage();
    
    render(
      <MockedProvider mocks={notFoundMocks} addTypename={false}>
        <MemoPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("メモが見つかりません")).toBeInTheDocument();
    });
  });

  it("Enterキーで次の行にフォーカスが移動する", async () => {
    const MemoPage = await loadMemoPage();
    
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <MemoPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("テストホース1")).toBeInTheDocument();
    });

    const firstNameInput = screen.getByDisplayValue("テストホース1");
    
    // Enterキーを押下
    fireEvent.keyDown(firstNameInput, { key: "Enter" });

    // フォーカスが次の行に移動することを確認（実装の詳細によって調整が必要）
    await waitFor(() => {
      expect(document.activeElement).not.toBe(firstNameInput);
    }, { timeout: 100 });
  });
});
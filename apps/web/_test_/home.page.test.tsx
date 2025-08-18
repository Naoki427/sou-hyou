import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockedProvider } from "@apollo/client/testing";
import type { ComponentType } from "react";

// モック設定
const pushMock = vi.fn();
const logoutMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/home",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/firebase", () => ({ logout: logoutMock }));

// デフォルトで認証済みユーザーをモック
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ 
    isAuthenticated: true, 
    isLoading: false, 
    user: { displayName: "Test User", email: "test@example.com", photoURL: "" } 
  }),
}));

import { gql } from "@apollo/client";

// GraphQLクエリを定義
const MY_ITEMS = gql`
  query MyItems($parentId: ID) {
    myItems(parentId: $parentId) {
      id
      name
      path
      type
      updatedAt
    }
  }
`;

const RECENT = gql`
  query Recent($limit: Int) {
    myRecentMemos(limit: $limit) {
      id name path updatedAt
    }
  }
`;

const ITEM_BY_PATH = gql`
  query ItemByPath($path: String!) {
    itemByPath(path: $path) {
      id
      name
      path
      type
      parent
    }
  }
`;

const CREATE_FOLDER = gql`
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id name path type
    }
  }
`;

const CREATE_MEMO = gql`
  mutation CreateMemo($input: CreateMemoInput!) {
    createMemo(input: $input) {
      id name path type
    }
  }
`;

// テストデータ
const mockItems = [
  {
    id: "folder1",
    type: "FOLDER",
    name: "テストフォルダ1",
    path: "/テストフォルダ1",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "memo1",
    type: "MEMO", 
    name: "テストメモ1",
    path: "/テストメモ1",
    updatedAt: "2024-01-14T09:15:00Z"
  }
];

const mockRecentMemos = [
  {
    id: "memo1",
    name: "最近のメモ1",
    path: "/最近のメモ1",
    updatedAt: "2024-01-15T12:00:00Z"
  },
  {
    id: "memo2", 
    name: "最近のメモ2",
    path: "/フォルダ/最近のメモ2",
    updatedAt: "2024-01-14T11:30:00Z"
  }
];

const mocks = [
  {
    request: {
      query: MY_ITEMS,
      variables: { parentId: null }
    },
    result: {
      data: {
        myItems: mockItems
      }
    }
  },
  {
    request: {
      query: RECENT,
      variables: { limit: 5 }
    },
    result: {
      data: {
        myRecentMemos: mockRecentMemos
      }
    }
  },
  {
    request: {
      query: ITEM_BY_PATH,
      variables: { path: "/" }
    },
    result: {
      data: {
        itemByPath: null
      }
    }
  },
  {
    request: {
      query: CREATE_FOLDER,
      variables: {
        input: {
          name: "新しいフォルダ",
          parentId: null
        }
      }
    },
    result: {
      data: {
        createFolder: {
          id: "new-folder",
          type: "FOLDER",
          name: "新しいフォルダ",
          path: "/新しいフォルダ"
        }
      }
    }
  },
  {
    request: {
      query: CREATE_MEMO,
      variables: {
        input: {
          name: "新しいメモ",
          parentId: null,
          horses: Array(8).fill(null).map(() => ({
            name: "",
            predictionMark: "MUZIRUSHI",
            fields: []
          }))
        }
      }
    },
    result: {
      data: {
        createMemo: {
          id: "new-memo",
          type: "MEMO",
          name: "新しいメモ",
          path: "/新しいメモ"
        }
      }
    }
  }
];

async function loadPageView(): Promise<ComponentType<any>> {
  const mod = await import("@/components/home/PageView");
  return mod.PageView as ComponentType<any>;
}

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ルートパスでアイテム一覧とタイルが表示される", async () => {
    vi.resetModules();
    const PageView = await loadPageView();

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <PageView segments={[]} />
      </MockedProvider>
    );

    // Home タイトルが表示される（h1要素を特定）
    expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();

    // ローディング後にアイテムが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("テストフォルダ1")).toBeInTheDocument();
      expect(screen.getByText("テストメモ1")).toBeInTheDocument();
    });

    // "この階層"セクションが表示される
    expect(screen.getByText("この階層")).toBeInTheDocument();
  });

  it("フォルダのリンクが正しく設定される", async () => {
    vi.resetModules();
    const PageView = await loadPageView();

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <PageView segments={[]} />
      </MockedProvider>
    );

    await waitFor(() => {
      const folderLink = screen.getByText("テストフォルダ1").closest("a");
      expect(folderLink).toHaveAttribute("href", "/home/テストフォルダ1");
    });
  });

  it("メモのリンクが正しく設定される", async () => {
    vi.resetModules();
    const PageView = await loadPageView();

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <PageView segments={[]} />
      </MockedProvider>
    );

    await waitFor(() => {
      const memoLink = screen.getByText("テストメモ1").closest("a");
      expect(memoLink).toHaveAttribute("href", "/home/テストメモ1");
    });
  });

  it("ネストしたフォルダパスでフォルダ名が表示される", async () => {
    vi.resetModules();
    const PageView = await loadPageView();

    const nestedMocks = [
      {
        request: {
          query: ITEM_BY_PATH,
          variables: { path: "/フォルダ1/フォルダ2" }
        },
        result: {
          data: {
            itemByPath: {
              id: "folder2",
              type: "FOLDER",
              name: "フォルダ2", 
              path: "/フォルダ1/フォルダ2"
            }
          }
        }
      },
      {
        request: {
          query: MY_ITEMS,
          variables: { parentId: "folder2" }
        },
        result: {
          data: {
            myItems: []
          }
        }
      }
    ];

    render(
      <MockedProvider mocks={nestedMocks} addTypename={false}>
        <PageView segments={["フォルダ1", "フォルダ2"]} />
      </MockedProvider>
    );

    // フォルダ名がh1で表示されることを確認
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "フォルダ2" })).toBeInTheDocument();
    });
  });

  it("基本的なページ構造が表示される", async () => {
    vi.resetModules();
    const PageView = await loadPageView();

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <PageView segments={[]} />
      </MockedProvider>
    );

    // 基本的な要素が存在することを確認
    expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
    
    // データロード後に「この階層」が表示される
    await waitFor(() => {
      expect(screen.getByText("この階層")).toBeInTheDocument();
    });
  });

  it("アイテムがない場合に空の状態が表示される", async () => {
    vi.resetModules();
    const PageView = await loadPageView();

    const emptyMocks = [
      {
        request: {
          query: MY_ITEMS,
          variables: { parentId: null }
        },
        result: {
          data: {
            myItems: []
          }
        }
      }
    ];

    render(
      <MockedProvider mocks={emptyMocks} addTypename={false}>
        <PageView segments={[]} />
      </MockedProvider>
    );

    // 空の状態が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("アイテムはありません")).toBeInTheDocument();
    });
  });
});
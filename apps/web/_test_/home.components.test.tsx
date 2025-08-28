import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { ComponentType } from "react";

// モック設定
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/home",
}));

// テストデータ
const mockItem = {
  id: "test-id",
  type: "FOLDER" as const,
  name: "テストフォルダ",
  path: "/テストフォルダ",
  updatedAt: "2024-01-15T10:30:00Z"
};

const mockMemoItem = {
  id: "memo-id",
  type: "MEMO" as const,
  name: "テストメモ",
  path: "/テストメモ",
  updatedAt: "2024-01-14T09:15:00Z"
};

async function loadItemTile(): Promise<ComponentType<any>> {
  const mod = await import("@/components/home/ItemTile");
  return mod.ItemTile as ComponentType<any>;
}

async function loadCreateTile(): Promise<ComponentType<any>> {
  const mod = await import("@/components/home/CreateTile");
  return mod.CreateTile as ComponentType<any>;
}

async function loadItemGrid(): Promise<ComponentType<any>> {
  const mod = await import("@/components/home/ItemGrid");
  return mod.ItemGrid as ComponentType<any>;
}

describe("Home Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ItemTile", () => {
    it("フォルダアイテムが正しく表示される", async () => {
      const ItemTile = await loadItemTile();

      render(<ItemTile item={mockItem} />);

      expect(screen.getByText("テストフォルダ")).toBeInTheDocument();
      
      // リンクが正しく設定されている
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/home/テストフォルダ");
      expect(link).toHaveAttribute("title", "テストフォルダ");
      
      // フォルダアイコンが表示されることを確認（Imageがある）
      const img = link.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "/folder.svg");
    });

    it("メモアイテムが正しく表示される", async () => {
      const ItemTile = await loadItemTile();

      render(<ItemTile item={mockMemoItem} />);

      expect(screen.getByText("テストメモ")).toBeInTheDocument();
      
      // リンクが正しく設定されている
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/home/テストメモ");
      expect(link).toHaveAttribute("title", "テストメモ");
      
      // メモアイコンが表示されることを確認（Imageがある）
      const img = link.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "/memo.svg");
    });

    it("フォルダクリックで正しいパスに遷移する", async () => {
      const ItemTile = await loadItemTile();

      render(<ItemTile item={mockItem} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/home/テストフォルダ");
    });

    it("メモクリックで正しいパスに遷移する", async () => {
      const ItemTile = await loadItemTile();

      render(<ItemTile item={mockMemoItem} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/home/テストメモ");
    });

    it("長いアイテム名が適切に表示される", async () => {
      const ItemTile = await loadItemTile();
      const longNameItem = {
        ...mockItem,
        name: "とても長いフォルダ名でテキストの表示をテストするためのフォルダです"
      };

      render(<ItemTile item={longNameItem} />);

      expect(screen.getByText("とても長いフォルダ名でテキストの表示をテストするためのフォルダです")).toBeInTheDocument();
    });
  });

  describe("CreateTile", () => {
    it("フォルダ作成タイルが正しく表示される", async () => {
      const CreateTile = await loadCreateTile();

      render(<CreateTile kind="folder" parentId={null} parentPath="/" />);

      expect(screen.getByText("フォルダを作成")).toBeInTheDocument();
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "フォルダを作成");
      
      // アイコンが表示されている（Image要素）
      const img = button.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "/add_folder.svg");
    });

    it("メモ作成タイルが正しく表示される", async () => {
      const CreateTile = await loadCreateTile();

      render(<CreateTile kind="memo" parentId={null} parentPath="/" />);

      expect(screen.getByText("メモを作成")).toBeInTheDocument();
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "メモを作成");
      
      // アイコンが表示されている（Image要素）
      const img = button.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "/add_memo.svg");
    });

    it("ボタンクリックでカスタムイベントが発火される", async () => {
      const CreateTile = await loadCreateTile();

      // カスタムイベントリスナーをモック
      const eventMock = vi.fn();
      window.addEventListener("open-create-folder", eventMock);

      render(<CreateTile kind="folder" parentId="test-id" parentPath="/test" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(eventMock).toHaveBeenCalledTimes(1);
      
      // イベントの詳細を確認
      const event = eventMock.mock.calls[0][0];
      expect(event.detail).toEqual({
        parentId: "test-id",
        parentPath: "/test"
      });

      window.removeEventListener("open-create-folder", eventMock);
    });
  });


  describe("ItemGrid", () => {
    it("アイテムグリッドが正しく表示される", async () => {
      const ItemGrid = await loadItemGrid();
      const items = [mockItem, mockMemoItem];

      const headerTiles = (
        <>
          <div>Header Content</div>
        </>
      );

      render(<ItemGrid headerTiles={headerTiles} items={items} />);

      // ヘッダーコンテンツが表示される
      expect(screen.getByText("Header Content")).toBeInTheDocument();
      
      // セクションタイトルが表示される
      expect(screen.getByText("この階層")).toBeInTheDocument();

      // 全てのアイテムが表示される
      expect(screen.getByText("テストフォルダ")).toBeInTheDocument();
      expect(screen.getByText("テストメモ")).toBeInTheDocument();
    });

    it("アイテムがない場合の表示", async () => {
      const ItemGrid = await loadItemGrid();

      const headerTiles = <div>Empty Header</div>;

      render(<ItemGrid headerTiles={headerTiles} items={[]} />);

      // セクションタイトルが表示される
      expect(screen.getByText("この階層")).toBeInTheDocument();
      
      // 空の状態が表示される
      expect(screen.getByText("アイテムはありません")).toBeInTheDocument();
    });

    it("レスポンシブグリッドレイアウトが適用される", async () => {
      const ItemGrid = await loadItemGrid();
      const items = Array.from({ length: 12 }, (_, i) => ({
        id: `item${i}`,
        type: "FOLDER" as const,
        name: `フォルダ${i}`,
        path: `/フォルダ${i}`,
        updatedAt: "2024-01-15T10:30:00Z"
      }));

      const headerTiles = <div>Grid Header</div>;

      const { container } = render(<ItemGrid headerTiles={headerTiles} items={items} />);

      // セクション要素が存在することを確認
      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
      
      // グリッドボディが存在することを確認
      const bodyElement = container.querySelector(".body");
      expect(bodyElement).toBeInTheDocument();
    });
  });
});
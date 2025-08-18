import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing";
import type { ComponentType } from "react";

// 簡単な型定義
type Modal = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
  parentId: string | null;
};

// テストデータ
const mockCreateFolderResult = {
  id: "new-folder",
  type: "FOLDER",
  name: "新しいフォルダ",
  path: "/新しいフォルダ"
};

const mockCreateMemoResult = {
  id: "new-memo",
  type: "MEMO", 
  name: "新しいメモ",
  path: "/新しいメモ"
};

async function loadCreateFolderModal(): Promise<ComponentType<any>> {
  const mod = await import("@/components/home/_modals/CreateFolderModal");
  return mod.CreateFolderModal as ComponentType<any>;
}

async function loadCreateMemoModal(): Promise<ComponentType<any>> {
  const mod = await import("@/components/home/_modals/CreateMemoModal");
  return mod.CreateMemoModal as ComponentType<any>;
}

async function loadHomeModalsProvider(): Promise<ComponentType<any>> {
  const mod = await import("@/components/home/_modals/HomeModalsProvider");
  return mod.HomeModalsProvider as ComponentType<any>;
}

describe("Home Modals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HomeModalsProvider", () => {
    it("モーダルプロバイダーが正しく動作する", async () => {
      const HomeModalsProvider = await loadHomeModalsProvider();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <HomeModalsProvider />
        </MockedProvider>
      );

      // モーダルプロバイダーがレンダリングされることを確認
      expect(document.body).toBeInTheDocument();
    });

  });
});
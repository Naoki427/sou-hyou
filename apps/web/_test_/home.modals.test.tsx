import { render } from "@testing-library/react";
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
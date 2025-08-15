import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { ComponentType } from "react";

const logoutMock = vi.fn();

// デフォは未ログインのモック
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false, user: undefined }),
}));
// logout は固定モック
vi.mock("@/lib/firebase", () => ({ logout: logoutMock }));

// 毎回クリーンに Header を読み込む
async function loadHeader(): Promise<ComponentType<any>> {
  const mod = await import("@/components/Header");
  return mod.Header as ComponentType<any>;
}

describe("Header", () => {
  it("未ログイン時は『新規登録』が見える", async () => {
    vi.resetModules(); // ← キャッシュクリア（直前の doMock の影響をなくす）
    const Header = await loadHeader();

    render(<Header />);
    expect(screen.getByText("新規登録")).toBeInTheDocument();
    expect(screen.queryByText("ログアウト")).not.toBeInTheDocument();
  });

  it("ログイン時は『ログアウト』が見える & クリックでlogoutが呼ばれる", async () => {
    vi.resetModules();
    // ここでだけログイン状態に差し替え
    vi.doMock("@/hooks/useAuth", () => ({
      useAuth: () => ({
        isAuthenticated: true,
        isLoading: false,
        user: { displayName: "Taro", email: "t@example.com", photoURL: "" },
      }),
    }));

    const Header = await loadHeader();

    render(<Header />);
    const btn = screen.getByRole("button", { name: "ログアウト" });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});

import "@testing-library/jest-dom";
import { vi } from "vitest";

// App Router のフックをグローバルにモック
vi.mock("next/navigation", () => {
  const push = vi.fn();
  const replace = vi.fn();
  const prefetch = vi.fn();
  const back = vi.fn();
  const forward = vi.fn();
  const refresh = vi.fn();
  const redirect = vi.fn(); // 使っているなら

  return {
    // Client Components で呼ばれるやつ
    useRouter: () => ({ push, replace, prefetch, back, forward, refresh }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),

    // redirect を使っている実装のために用意（アサートも可能）
    redirect,
  };
});

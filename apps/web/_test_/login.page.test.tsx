import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ← ページ内で未ログイン前提にしたいので固定
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false, user: undefined }),
}));

// ← ページ内部で直接 SDK を呼ぶ想定
const signInWithEmailAndPassword = vi.fn().mockResolvedValue({ user: { uid: "u1" } });
const createUserWithEmailAndPassword = vi.fn();
const signInWithPopup = vi.fn();
const onIdTokenChanged = vi.fn();

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onIdTokenChanged,
  GoogleAuthProvider: vi.fn(() => ({})),
}));

// ← ページが参照するダミーを用意（auth / ensureUserUpsert など）
const ensureUserUpsert = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/firebase", () => ({
  auth: {} as any,
  ensureUserUpsert,
}));

// ページは動的 import（doMock の影響を確実に反映）
async function loadLoginPage() {
  const mod = await import("../src/app/login/page");
  return mod.default as React.ComponentType;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("/login page", () => {
  it("未入力で送信しても SDK は呼ばれない（バリデーションNG）", async () => {
    const Page = await loadLoginPage();
    render(<Page />);

    const submit = screen.getByRole("button", { name: /ログイン|login/i });

    const user = userEvent.setup();
    await user.click(submit); // 非同期クリック

    // 非同期バリデーションを考慮して waitFor で安定化
    await waitFor(() => {
      expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  it("正しい入力で signInWithEmailAndPassword(auth, email, password) が呼ばれる", async () => {
    const Page = await loadLoginPage();
    render(<Page />);

    const emailInput =
      screen.queryByLabelText(/メール|email/i) ??
      screen.getByPlaceholderText(/メール|email/i);
    const passwordInput =
      screen.queryByLabelText(/パスワード|password/i) ??
      screen.getByPlaceholderText(/パスワード|password/i);

    const user = userEvent.setup();
    await user.type(emailInput as HTMLElement, "taro@example.com");
    await user.type(passwordInput as HTMLElement, "P@ssw0rd!");

    const submit = screen.getByRole("button", { name: /ログイン|login/i });
    await user.click(submit);

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), // auth
        "taro@example.com",
        "P@ssw0rd!"
      );
    });
  });
});

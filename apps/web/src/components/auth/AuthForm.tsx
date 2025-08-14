"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const schema = yup.object({
  email: yup.string().email("メール形式が正しくありません").required("メールは必須です"),
  password: yup.string().min(8, "8文字以上で入力してください").required("パスワードは必須です"),
});
type Form = yup.InferType<typeof schema>;

function Divider() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, margin: "16px 0" }}>
      <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
      <span style={{ color: "#888", fontSize: 12 }}>— または —</span>
      <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
    </div>
  );
}

async function ensureUserUpsert() {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;
    await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query: "{ me { uid } }" }),
    });
  } catch {}
}

export default function AuthForm({ mode }: { mode: "register" | "login" }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: yupResolver(schema) });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    if (mode === "register") {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    await ensureUserUpsert();
    router.push("/home");
  });

  const onGoogle = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
    await ensureUserUpsert();
    router.push("/home");
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, color: "#555" }}>email</span>
        <input
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
        />
        {errors.email && <span style={{ color: "#c00", fontSize: 12 }}>{errors.email.message}</span>}
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, color: "#555" }}>password</span>
        <input
          type="password"
          placeholder="••••••••"
          {...register("password")}
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
        />
        {errors.password && <span style={{ color: "#c00", fontSize: 12 }}>{errors.password.message}</span>}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #222", background: "#222", color: "#fff", cursor: "pointer" }}
      >
        {mode === "register" ? "登録" : "ログイン"}
      </button>

      <Divider />

      <button
        type="button"
        onClick={onGoogle}
        disabled={isSubmitting}
        style={{
          padding: "10px 12px",
          borderRadius: 8, border: "1px solid #ddd", background: "#fff",
          display: "flex", alignItems: "center", gap: 8, justifyContent: "center", cursor: "pointer",
        }}
      >
        {/* 簡易Googleアイコン */}
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 33.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 6 .9 8.3 3l5.7-5.7C34.4 6.3 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11.1 0 20-8.9 20-20 0-1.3-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 18.9 13 24 13c3.1 0 6 .9 8.3 3l5.7-5.7C34.4 6.3 29.4 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5c-2 1.4-4.6 2.2-7.3 2.2-5.3 0-9.7-3.3-11.3-7.9l-6.6 5.1C7.6 39.8 15.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.7-4.9 6.5-9.3 6.5-3.3 0-6.1-1.7-7.7-4.3l-6.6 5.1C14.8 39.7 19.1 42 24 42c11.1 0 20-8.9 20-20 0-1.3-.1-2.4-.4-3.5z"/>
        </svg>
        Google で続行
      </button>

      {mode === "register" && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <span style={{ fontSize: 14, color: "#666" }}>
            既にアカウントをお持ちですか？{" "}
            <Link
              href="/login"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              ログイン
            </Link>
          </span>
        </div>
      )}
    </form>
  );
}

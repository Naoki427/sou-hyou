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
import Image from "next/image";

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
        <Image
          src="/google.png"
          alt=""
          aria-hidden
          width={32}
          height={32}
          style={{ display: "block" }}
        />
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

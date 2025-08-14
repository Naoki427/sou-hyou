// "use client";
// import { gql, useQuery } from "@apollo/client";
// import { loginWithGoogle, logout } from "../../lib/firebase";

// const ME = gql`query { me { uid email name } }`;

// export default function Page() {
//   const { data, refetch } = useQuery(ME, { fetchPolicy: "network-only" });
//   return (
//     <main style={{ padding: 16 }}>
//       <button onClick={() => loginWithGoogle().then(() => refetch())}>Googleでログイン</button>
//       <button onClick={() => logout().then(() => refetch())} style={{ marginLeft: 8 }}>ログアウト</button>
//       <pre>{JSON.stringify(data, null, 2)}</pre>
//     </main>
//   );
// }
// apps/web/src/app/register/page.tsx
"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <main style={{ padding: 16 }}>
      <h2>Email + Password</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
        <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="password" type="password" />

        <button onClick={async () => {
          const cred = await createUserWithEmailAndPassword(auth, email, pw);
          // 任意: メール確認を送る（本番では推奨）
          await sendEmailVerification(cred.user);
          alert("サインアップ完了。確認メールを送信しました。");
        }}>サインアップ</button>

        <button onClick={async () => {
          await signInWithEmailAndPassword(auth, email, pw);
          alert("ログイン成功");
        }}>ログイン</button>

        <button onClick={async () => {
          await sendPasswordResetEmail(auth, email);
          alert("パスワード再設定メールを送信しました");
        }}>パスワード再設定</button>
      </div>
    </main>
  );
}

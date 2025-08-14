"use client";
import { AuthRequired } from "@/components/auth/AuthRequired";

export default function Page() {
  return (
    <AuthRequired>
      <div style={{ padding: 24 }}>
        <h1>これはホームです</h1>
        <p>ログイン済みユーザー専用ページです。</p>
      </div>
    </AuthRequired>
  );
}
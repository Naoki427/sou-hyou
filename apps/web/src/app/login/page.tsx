"use client";
import AuthCard from "@/components/ui/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { GuestOnly } from "@/components/auth/GuestOnly";

export default function Page() {
  return (
    <GuestOnly>
      <AuthCard title="ログイン">
        <AuthForm mode="login" />
      </AuthCard>
    </GuestOnly>
  );
}

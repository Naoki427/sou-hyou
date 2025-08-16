"use client";
import { AuthRequired } from "@/components/auth/AuthRequired";
import { PageView } from "@/components/home/PageView";
import { use } from 'react'


export default function Page({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = use(params)
  return (
    <AuthRequired>
      <PageView segments={segments} />
    </AuthRequired>
  )
}

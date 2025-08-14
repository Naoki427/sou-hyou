"use client";
import { ReactNode } from "react";

export default function AuthCard({
  title,
  children,
}: { title: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "grid", placeItems: "center" }}>
      <div style={{
        width: "min(92vw, 420px)",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,.2)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #eee" }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>{title}</h1>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

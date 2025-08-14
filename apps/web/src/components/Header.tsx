"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/firebase";

export const Header = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1rem",
        backgroundColor: "#222",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: "1.25rem" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          sou-hyou
        </Link>
      </h1>
      <div>
        {isLoading ? (
          <span>Loading...</span>
        ) : isAuthenticated ? (
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ログアウト
          </button>
        ) : (
          <Link
            href="/register"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            新規登録
          </Link>
        )}
      </div>
    </header>
  );
};

// apps/web/src/components/Header.tsx
import Link from "next/link";

export const Header = () => {
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
    </header>
  );
};

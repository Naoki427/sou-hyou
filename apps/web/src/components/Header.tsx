"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/firebase";

export const Header = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const handleLogout = async () => {
    try { await logout(); } catch (e) { console.error(e); }
  };

  return (
    <header className="hdr">
      <h1 className="brand">
        <Link href="/" className="brand-link">
          <Image
            src="/logo.PNG" 
            alt="sou-hyou logo"
            width={40}
            height={40}
            className="logo"
            priority
          />
          <span>souhyou</span>
        </Link>
      </h1>

      <div className="actions">
        {isLoading ? (
          <span className="loading">Loading…</span>
        ) : isAuthenticated ? (
          <button className="btn btn-outline btn-danger" onClick={handleLogout}>
            ログアウト
          </button>
        ) : (
          <Link href="/register" className="btn btn-solid">
            新規登録
          </Link>
        )}
      </div>

      <style jsx>{`
        .hdr {
          display:flex; align-items:center; justify-content:space-between;
          padding:.75rem 1rem; background:#111; color:#f8fafc;
          border-bottom:1px solid #1f2937;
          min-height: 44px;
        }
        .brand { 
          margin:0; 
          font-size:1.1rem; 
          font-weight:700; 
          letter-spacing:.2px; 
          line-height: 1;
          display:flex;
          align-items:center;
        }

        .hdr :global(.brand-link) {
          display:flex;
          align-items:center;
          gap:.5rem;
          color:inherit; 
          text-decoration:none;
          line-height: 1;
        }

        .logo { 
          display:block;
          border-radius:6px; 
          object-fit:cover; 
        }

        .actions { display:flex; align-items:center; gap:.5rem; }
        .loading { opacity:.8; font-size:.9rem; }

        .hdr :global(.btn) {
          display:inline-flex; align-items:center; justify-content:center;
          gap:.375rem; padding:.55rem 1rem; border-radius:9999px;
          font-weight:700; font-size:.95rem; line-height:1;
          text-decoration:none; cursor:pointer;
          transition: background .18s ease, border-color .18s ease, color .18s ease, transform .05s ease;
          outline:none;
        }
        .hdr :global(.btn:active) { transform: translateY(1px); }
        .hdr :global(.btn:focus-visible) { outline:2px solid #fff; outline-offset:2px; }

        .hdr :global(.btn-outline) {
          color:#f8fafc; background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.25);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
        }
        .hdr :global(.btn-outline:hover) {
          background:rgba(255,255,255,.12);
          border-color:rgba(255,255,255,.35);
        }

        .hdr :global(.btn-solid) {
          color:#111827; background:#fff; border:1px solid #fff;
          box-shadow:0 1px 2px rgba(0,0,0,.08);
        }
        .hdr :global(.btn-solid:hover) { background:#f3f4f6; border-color:#f3f4f6; }

        .hdr :global(.btn-danger) { border-color: rgba(239,68,68,.55); }
        .hdr :global(.btn-danger:hover) {
          background: rgba(239,68,68,.16);
          border-color: rgba(239,68,68,.75);
        }
      `}</style>
    </header>
  );
};

"use client";

import Link from "next/link";
import { memo, useMemo } from "react";

type Props = {
  segments: string[];
  base?: string;
  className?: string;
};

const safeDecode = (s: string) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

export const Breadcrumbs = memo(function Breadcrumbs({
  segments,
  base = "/home",
  className,
}: Props) {
  const decoded = useMemo(() => segments.map(safeDecode), [segments]);

  const items = useMemo(() => {
    const heads = [{ label: "Home", href: base }];
    const rest = decoded.map((seg, i) => {
      const hrefSegs = decoded
        .slice(0, i + 1)
        .map((s) => encodeURIComponent(s))
        .join("/");
      return { label: seg, href: `${base}/${hrefSegs}` };
    });
    return [...heads, ...rest];
  }, [decoded, base]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        color: "#6b7280",
        fontSize: 13,
      }}
    >
      {items.map((it, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={it.href} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {isLast ? (
              <span aria-current="page" style={{ color: "#111827", fontWeight: 600 }}>
                {it.label}
              </span>
            ) : (
              <Link href={it.href} style={{ textDecoration: "none", color: "#374151" }}>
                {it.label}
              </Link>
            )}
            {!isLast && <span aria-hidden>›</span>}
          </span>
        );
      })}
    </nav>
  );
});

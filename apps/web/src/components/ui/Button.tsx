// apps/web/src/components/ui/Button.tsx
"use client";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md";

type Props = {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = "outline",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth,
  style,
  ...rest
}: Props) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    transition: "background-color .12s ease, border-color .12s ease, color .12s ease",
    width: fullWidth ? "100%" : undefined,
    font: "inherit",
  };

  const sizeCss: Record<Size, React.CSSProperties> = {
    sm: { padding: "6px 10px", fontSize: 13, lineHeight: "18px" },
    md: { padding: "8px 12px", fontSize: 14, lineHeight: "20px" },
  };

  const variantCss: Record<Variant, React.CSSProperties> = {
    primary: { background: "#111827", color: "#fff", border: "1px solid #111827" },
    outline: { background: "#fff", color: "#111827", border: "1px solid #e5e7eb" },
    ghost:   { background: "transparent", color: "#111827", border: "1px solid transparent" },
  };

  return (
    <button
      {...rest}
      style={{ ...base, ...sizeCss[size], ...variantCss[variant], ...style }}
    >
      {iconLeft && <span aria-hidden>{iconLeft}</span>}
      {children}
      {iconRight && <span aria-hidden>{iconRight}</span>}
    </button>
  );
}

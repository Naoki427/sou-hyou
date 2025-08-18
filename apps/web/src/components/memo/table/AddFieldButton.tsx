"use client";
import { Button } from "@/components/ui/Button";

export function AddFieldButton(props: { onClick?: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={props.onClick}
      title="フィールドを追加"
      iconLeft={<PlusIcon />}
    >
    </Button>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

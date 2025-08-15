"use client";
import { useEffect, useState } from "react";
import { CreateFolderModal } from "./CreateFolderModal";
import { CreateMemoModal } from "./CreateMemoModal";

type OpenDetail = { parentId: string | null; parentPath: string };

export function HomeModalsProvider() {
  const [folder, setFolder] = useState<OpenDetail | null>(null);
  const [memo, setMemo] = useState<OpenDetail | null>(null);

  useEffect(() => {
    const onFolder = (e: Event) => {
      const ce = e as CustomEvent<OpenDetail>;
      setFolder(ce.detail);
    };
    const onMemo = (e: Event) => {
      const ce = e as CustomEvent<OpenDetail>;
      setMemo(ce.detail);
    };
    window.addEventListener("open-create-folder", onFolder);
    window.addEventListener("open-create-memo", onMemo);
    return () => {
      window.removeEventListener("open-create-folder", onFolder);
      window.removeEventListener("open-create-memo", onMemo);
    };
  }, []);

  return (
    <>
      <CreateFolderModal
        open={!!folder}
        onClose={() => setFolder(null)}
        parentId={folder?.parentId ?? null}
        parentPath={folder?.parentPath ?? "/"}
      />
      <CreateMemoModal
        open={!!memo}
        onClose={() => setMemo(null)}
        parentId={memo?.parentId ?? null}
        parentPath={memo?.parentPath ?? "/"}
      />
    </>
  );
}

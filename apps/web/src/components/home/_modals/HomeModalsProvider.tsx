"use client";
import { useEffect, useState } from "react";
import { CreateFolderModal } from "./CreateFolderModal";
import { CreateMemoModal } from "./CreateMemoModal";
import { DeleteItemModal } from "./DeleteItemModal";
import { RenameItemModal } from "./RenameItemModal";

type OpenDetail = { parentId: string | null; parentPath: string };
type DeleteDetail = { id: string; name?: string };
type RenameDetail = { id: string; name: string };

export function HomeModalsProvider() {
  const [folder, setFolder] = useState<OpenDetail | null>(null);
  const [memo, setMemo] = useState<OpenDetail | null>(null);

  const [toDelete, setToDelete] = useState<DeleteDetail | null>(null);
  const [toRename, setToRename] = useState<RenameDetail | null>(null);

  useEffect(() => {
    const onFolder = (e: Event) => setFolder((e as CustomEvent<OpenDetail>).detail);
    const onMemo = (e: Event) => setMemo((e as CustomEvent<OpenDetail>).detail);

    const onDelete = (e: Event) => setToDelete((e as CustomEvent<DeleteDetail>).detail);
    const onRename = (e: Event) => setToRename((e as CustomEvent<RenameDetail>).detail);

    window.addEventListener("open-create-folder", onFolder);
    window.addEventListener("open-create-memo", onMemo);
    window.addEventListener("open-delete-item", onDelete);
    window.addEventListener("open-rename-item", onRename);
    return () => {
      window.removeEventListener("open-create-folder", onFolder);
      window.removeEventListener("open-create-memo", onMemo);
      window.removeEventListener("open-delete-item", onDelete);
      window.removeEventListener("open-rename-item", onRename);
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

      <DeleteItemModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        id={toDelete?.id ?? ""}
        name={toDelete?.name ?? ""}
      />

      <RenameItemModal
        open={!!toRename}
        onClose={() => setToRename(null)}
        id={toRename?.id ?? ""}
        initialName={toRename?.name ?? ""}
      />
    </>
  );
}


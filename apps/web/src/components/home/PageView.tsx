// apps/web/src/components/page/PageView.tsx
"use client";

import { gql, useQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Breadcrumbs } from "../nav/Breadcrumbs";
import { Item } from "./types";
import { ItemGrid } from "./ItemGrid";
import { CreateTile } from "./CreateTile";
import { RecentMemosTile } from "./RecentMemosTile";
import { HomeModalsProvider } from "./_modals/HomeModalsProvider";
import { decodeSegments } from "@/lib/urlEncoding";

const ITEM_BY_PATH = gql`
  query ItemByPath($path: String!) {
    itemByPath(path: $path) {
      id
      name
      path
      type   # "FOLDER" | "MEMO"
      parent
    }
  }
`;

const MY_ITEMS = gql`
  query MyItems($parentId: ID) {
    myItems(parentId: $parentId) {
      id
      name
      path
      type
      updatedAt
    }
  }
`;

type Props = {
  segments?: string[];
};

export function PageView({
  segments = [],
}: Props) {
  const router = useRouter();
  const decoded = useMemo(() => decodeSegments(segments), [segments]);
  const atRoot = segments.length === 0;
//   const path = useMemo(() => "/" + segments.join("/"), [segments]);
const path = useMemo(() => "/" + decoded.join("/"), [decoded]);

  // root 以外は現在のアイテムを解決（フォルダ or メモ or 404）
  const {
    data: byPathData,
    loading: byPathLoading,
    error: byPathError,
  } = useQuery(ITEM_BY_PATH, {
    variables: { path },
    skip: atRoot,
    fetchPolicy: "cache-and-network",
  });

  // myItems を、root なら parentId:null、フォルダなら parentId:そのID で取得
  const parentIdForList: string | null | undefined = atRoot
    ? null
    : byPathData?.itemByPath?.type === "FOLDER"
    ? byPathData.itemByPath.id
    : undefined;

  const skipList =
    (!atRoot && !byPathData) ||
    (!atRoot && byPathData?.itemByPath?.type !== "FOLDER");

  const {
    data: listData,
    loading: listLoading,
    error: listError,
  } = useQuery(MY_ITEMS, {
    variables: { parentId: parentIdForList ?? null },
    skip: skipList,
    fetchPolicy: "cache-and-network",
  });

  // メモなら個別画面へ誘導
  useEffect(() => {
    if (atRoot || byPathLoading) return;
    const item: Item | undefined = byPathData?.itemByPath ?? undefined;
    if (item?.type === "MEMO" && item.id) {
      router.replace(`/memo/${item.id}`);
    }
  }, [atRoot, byPathLoading, byPathData, router]);


  // ========== ルート ==========
  if (atRoot) {
    const items: Item[] = listData?.myItems ?? [];
    return (
      <>
        <div style={{ padding: 16 }}>
          <Breadcrumbs segments={[]} />
          <h1 style={{ marginBottom: 12 }}>Home</h1>

          {listError && (
            <p style={{ color: "#c00" }}>読み込みエラー：{listError.message}</p>
          )}

          {listLoading ? (
            <div>読み込み中…</div>
          ) : (
            <ItemGrid
              headerTiles={
                <>
                  <CreateTile kind="folder" parentId={null} parentPath="/" />
                  <CreateTile kind="memo"   parentId={null} parentPath="/" />
                  <RecentMemosTile />
                </>
              }
              items={items}
            />
          )}
        </div>
        <HomeModalsProvider />
      </>
    );
  }

  // ========== 非ルート：ロード/エラー/404 ==========
  if (byPathLoading) return <div style={{ padding: 16 }}>読み込み中…</div>;
  if (byPathError) {
    return (
      <div style={{ padding: 16 }}>
        <p style={{ color: "#c00" }}>読み込みエラー：{byPathError.message}</p>
      </div>
    );
  }

  const item: Item | null = byPathData?.itemByPath ?? null;
  if (!item) {
    return (
      <div style={{ padding: 16 }}>
        <Breadcrumbs segments={segments} />
        <h1>404 Not Found</h1>
        <p style={{ color: "#666" }}>
          このパス「{path}」に対応するフォルダ/メモが見つかりませんでした。
        </p>
      </div>
    );
  }

  // ========== メモ ==========
  if (item.type === "MEMO") {
    return <div style={{ padding: 16 }}>メモ詳細に移動中…</div>;
  }

  // ========== フォルダ ==========
  const items: Item[] = listData?.myItems ?? [];

  return (
    <>
      <div style={{ padding: 16 }}>
        <Breadcrumbs segments={segments} />
        <h1 style={{ marginBottom: 12 }}>{item.name}</h1>

        {listError && (
          <p style={{ color: "#c00" }}>読み込みエラー：{listError.message}</p>
        )}

        {listLoading ? (
          <div>読み込み中…</div>
        ) : (
          <ItemGrid
            headerTiles={
              <>
                <CreateTile kind="folder" parentId={item.id} parentPath={item.path} />
                <CreateTile kind="memo"   parentId={item.id} parentPath={item.path} />
                <RecentMemosTile />
              </>
            }
            items={items}
          />
        )}
      </div>
      <HomeModalsProvider />
    </>
  );
}

// "use client";

// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { useMemo, useCallback } from "react";
// import { gql, useQuery } from "@apollo/client";
// import { HomeModalsProvider } from "../_modals/HomeModalsProvider";

// // === GraphQL ===
// const ITEM_BY_PATH = gql`
//   query ItemByPath($path: String!) {
//     itemByPath(path: $path) {
//       id
//       name
//       path
//       type
//       parent
//       ancestors
//       horses {
//         name
//         predictionMark
//         fields { label type value }
//       }
//       updatedAt
//     }
//   }
// `;

// const MY_ITEMS = gql`
//   query MyItems($parentId: ID) {
//     myItems(parentId: $parentId) {
//       id
//       name
//       path
//       type
//       updatedAt
//     }
//   }
// `;

// const MY_RECENT_MEMOS = gql`
//   query MyRecentMemos($limit: Int) {
//     myRecentMemos(limit: $limit) {
//       id
//       name
//       path
//       updatedAt
//     }
//   }
// `;

// // === UI: パンくず ===
// function Breadcrumbs({ segments }: { segments: string[] }) {
//   const crumbs = useMemo(() => {
//     const list = [{ label: "Home", href: "/home" }];
//     let acc = "";
//     for (const seg of segments) {
//       acc += `/${seg}`;
//       list.push({ label: seg, href: `/home${acc}` });
//     }
//     return list;
//   }, [segments]);

//   return (
//     <nav aria-label="breadcrumbs" style={{ fontSize: 13, color: "#666" }}>
//       {crumbs.map((c, i) => (
//         <span key={c.href}>
//           {i > 0 && " › "}
//           <Link href={c.href} style={{ textDecoration: "none", color: "#444" }}>
//             {c.label}
//           </Link>
//         </span>
//       ))}
//     </nav>
//   );
// }

// // === UI: 一覧 ===
// function ItemList({
//   title,
//   items,
// }: {
//   title: string;
//   items: { id: string; name: string; path: string; type: "FOLDER" | "MEMO" | string }[];
// }) {
//   return (
//     <section style={{ display: "grid", gap: 8 }}>
//       <h2 style={{ margin: "8px 0 4px", fontSize: 14, color: "#666" }}>{title}</h2>
//       <div style={{ display: "grid", gap: 8 }}>
//         {items.length === 0 && (
//           <div style={{ color: "#888", fontSize: 14 }}>何もありません</div>
//         )}
//         {items.map((it) => {
//           const href = `/home${it.path}`;
//           const badge =
//             it.type === "FOLDER" || it.type === "folder" ? "📁" :
//             it.type === "MEMO"   || it.type === "memo"   ? "📝" :
//             "•";
//           return (
//             <Link
//               key={it.id}
//               href={href}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 10,
//                 padding: "10px 12px",
//                 border: "1px solid #eee",
//                 borderRadius: 10,
//                 textDecoration: "none",
//                 color: "#222",
//               }}
//             >
//               <span style={{ width: 22, textAlign: "center" }}>{badge}</span>
//               <span style={{ fontWeight: 600 }}>{it.name}</span>
//               <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>
//                 {it.path}
//               </span>
//             </Link>
//           );
//         })}
//       </div>
//     </section>
//   );
// }

// // === UI: メモ詳細（読み取り） ===
// function MemoDetail({
//   memo,
// }: {
//   memo: {
//     id: string;
//     name: string;
//     path: string;
//     horses?: { name: string; predictionMark: string; fields: { label: string; type: string; value: any }[] }[];
//   };
// }) {
//   return (
//     <section style={{ display: "grid", gap: 10 }}>
//       <h2 style={{ margin: "8px 0 4px" }}>{memo.name}</h2>
//       <div style={{ color: "#888", fontSize: 13 }}>{memo.path}</div>

//       {(memo.horses ?? []).length === 0 ? (
//         <div style={{ color: "#888", fontSize: 14 }}>まだ馬データがありません</div>
//       ) : (
//         <div style={{ display: "grid", gap: 12 }}>
//           {memo.horses!.map((h, i) => (
//             <div
//               key={`${h.name}-${i}`}
//               style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}
//             >
//               <div style={{ fontWeight: 700, marginBottom: 6 }}>
//                 {h.predictionMark} {h.name}
//               </div>
//               {(h.fields ?? []).length > 0 && (
//                 <ul style={{ margin: 0, paddingLeft: 18 }}>
//                   {h.fields.map((f, j) => (
//                     <li key={j} style={{ fontSize: 14 }}>
//                       <b>{f.label}</b> ({f.type}):{" "}
//                       <span>{String(f.value ?? "")}</span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </section>
//   );
// }

// // === メインページ ===
// export default function HomePage({
//   params,
// }: {
//   params: { segments?: string[] };
// }) {
//   const segments = params.segments ?? [];
//   const atRoot = segments.length === 0;
//   const path = "/" + segments.join("/");

//   // ルート以外のときだけ現在地を解決
//   const { data: byPathData, loading: byPathLoading, error: byPathError } = useQuery(
//     ITEM_BY_PATH,
//     { variables: { path }, skip: atRoot }
//   );
//   const current = byPathData?.itemByPath;

//   // 直下一覧
//   const parentIdForList =
//     atRoot ? null : current?.type === "FOLDER" || current?.type === "folder" ? current.id : undefined;

//   const openCreateFolder = useCallback(() => {
//     const payload = { parentId: parentIdForList ?? null, parentPath: atRoot ? "/" : path };
//     window.dispatchEvent(new CustomEvent("open-create-folder", { detail: payload }));
//     }, [parentIdForList, atRoot, path]);

//     const openCreateMemo = useCallback(() => {
//     const payload = { parentId: parentIdForList ?? null, parentPath: atRoot ? "/" : path };
//     window.dispatchEvent(new CustomEvent("open-create-memo", { detail: payload }));
//     }, [parentIdForList, atRoot, path]);

//   const { data: listData, loading: listLoading, error: listError, refetch: refetchList } = useQuery(
//     MY_ITEMS,
//     { variables: { parentId: parentIdForList }, skip: parentIdForList === undefined }
//   );

//   // 最近メモ（/home のときだけ）
//   const { data: recentData, loading: recentLoading, error: recentError } = useQuery(
//     MY_RECENT_MEMOS,
//     { variables: { limit: 10 }, skip: !atRoot }
//   );

//   // ローディングとエラー（シンプル扱い）
//   if (!atRoot && byPathLoading) return <div style={{ padding: 16 }}>読み込み中...</div>;
//   if (byPathError) return <div style={{ padding: 16, color: "#c00" }}>エラー: {byPathError.message}</div>;
//   if (!atRoot && !current) return <div style={{ padding: 16 }}>見つかりませんでした（404）</div>;

//   const items = listData?.myItems ?? [];
//   const recent = recentData?.myRecentMemos ?? [];

//   const isFolder = atRoot || current?.type === "FOLDER" || current?.type === "folder";
//   const isMemo = current?.type === "MEMO" || current?.type === "memo";

//   return (
//     <main style={{ padding: 16, display: "grid", gap: 16 }}>
//       <Breadcrumbs segments={segments} />

//       {/* ヘッダー行（タイトル + 作成ボタン） */}
//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
//           {atRoot ? "Home" : current?.name}
//         </h1>
//         <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
//           {/* ここは後でモーダルを差し替える */}
//           <button
//             onClick={openCreateFolder}
//             style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}
//             disabled={isMemo} // メモ配下には作れない（親がフォルダのときだけ）
//             title={isMemo ? "メモ配下にはフォルダを作成できません" : "フォルダ作成"}
//           >
//             ＋ フォルダ
//           </button>
//           <button
//             onClick={openCreateMemo}
//             style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}
//             disabled={isMemo} // 同上
//             title={isMemo ? "メモ配下にはメモを作成できません" : "メモ作成"}
//           >
//             ＋ メモ
//           </button>
//         </div>
//       </div>

//       {/* フォルダ or ルート: 直下一覧 */}
//       {isFolder && (
//         <ItemList
//           title="この階層のアイテム"
//           items={items}
//         />
//       )}

//       {/* ルートのみ: 最近更新したメモ */}
//       {atRoot && (
//         <ItemList
//           title="最近更新したメモ"
//           items={recent}
//         />
//       )}

//       {/* メモのとき: 詳細 */}
//       {isMemo && current && (
//         <MemoDetail memo={current} />
//       )}

//       {/* 補助: 一覧ローディング/エラー表示（簡易） */}
//       {(listLoading || recentLoading) && (
//         <div style={{ color: "#888", fontSize: 14 }}>読み込み中...</div>
//       )}
//       {listError && <div style={{ color: "#c00" }}>一覧エラー: {listError.message}</div>}
//       {recentError && <div style={{ color: "#c00" }}>最近メモエラー: {recentError.message}</div>}
//       <HomeModalsProvider />
//     </main>
//   );
// }

"use client";
import { AuthRequired } from "@/components/auth/AuthRequired";
import { PageView } from "@/components/home/PageView";
import { use } from 'react'


export default function Page({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = use(params)
  return (
    <AuthRequired>
      <PageView segments={segments} />
    </AuthRequired>
  )
}

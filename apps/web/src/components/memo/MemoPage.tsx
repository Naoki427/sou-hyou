"use client";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { Memo, FieldType, PredictionMark } from "./types";
import { MemoTable } from "./table/MemoTable";
import { GET_MEMO, SET_HORSE_PROP, SET_FIELD_VALUE } from "./queries";

export function MemoPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { data, loading, error, refetch } = useQuery(GET_MEMO, {
    variables: { id },
    fetchPolicy: "cache-and-network",
  });
  
  const [setHorseProp] = useMutation(SET_HORSE_PROP);
  const [setFieldValue] = useMutation(SET_FIELD_VALUE);
  const [saving, setSaving] = useState(false);
  
  const memo: Memo = data?.item;
  const horses = memo?.horses ?? [];

  if (loading) return <div style={{ padding: 16 }}>読み込み中…</div>;
  if (error) return <div style={{ padding: 16, color: "#c00" }}>読み込みエラー: {error.message}</div>;
  if (!memo) return <div style={{ padding: 16 }}>メモが見つかりません</div>;

  const onChangeMark = async (row: number, value: PredictionMark) => {
    setSaving(true);
    try {
      await setHorseProp({ variables: { memoId: memo.id, index: row, predictionMark: value } });
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const onBlurName = async (row: number, value: string) => {
    if (value === horses[row]?.name) return;
    setSaving(true);
    try {
      await setHorseProp({ variables: { memoId: memo.id, index: row, name: value } });
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const onBlurField = async (row: number, label: string, type: FieldType, value: string) => {
    let v: unknown = value;
    if (type === "NUMBER") {
      if (value === "") v = null;
      else if (!/^-?\d+(\.\d+)?$/.test(value)) return;
      else v = Number(value);
    }
    setSaving(true);
    try {
      await setFieldValue({ variables: { memoId: memo.id, index: row, label, type, value: v } });
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>{memo.name}</h1>

      <MemoTable
        horses={horses}
        onChangeMark={onChangeMark}
        onBlurName={onBlurName}
        onBlurField={onBlurField}
      />

      <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
        {saving ? "保存中…" : "　"}
      </div>
    </div>
  );
}
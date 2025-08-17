export type FieldType = "NUMBER" | "SELECT" | "COMMENT";

export type PredictionMark =
  | "HONMEI" | "TAIKOU" | "TANNANA" | "RENSHITA"
  | "HOSHI"  | "CHUUI"  | "KESHI"    | "MUZIRUSHI";

export type Field = {
  label: string;
  type: FieldType;
  value: string | number | null;
};

export type Horse = {
  name: string;
  predictionMark: PredictionMark;
  fields: Field[];
};

export type Memo = {
  id: string;
  name: string;
  path: string;
  type: string;
  horses: Horse[];
};

export const MARK_ORDER: PredictionMark[] = [
  "MUZIRUSHI", "HONMEI", "TAIKOU", "TANNANA",
  "RENSHITA", "HOSHI", "CHUUI", "KESHI",
];

export const MARK_LABEL: Record<PredictionMark, string> = {
  HONMEI: "◎",
  TAIKOU: "◯",
  TANNANA: "▲",
  RENSHITA: "△",
  HOSHI: "☆",
  CHUUI: "注",
  KESHI: "消",
  MUZIRUSHI: "　",
};
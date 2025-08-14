import { Schema, model, models } from "mongoose";

export type ItemType = "folder" | "memo";

const fieldSchema = new Schema(
  {
    label: { type: String, required: true },
    type: { type: String, enum: ["number", "select", "comment"], required: true },
    // MVPは柔軟さ優先で Mixed。必要に応じて文字列/数値に分離や JSON スキーマ化も可。
    value: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const horseSchema = new Schema(
  {
    name: { type: String, required: true },
    predictionMark: { type: String, required: true }, // ◎, 〇, ▲, △ など
    fields: { type: [fieldSchema], default: [] },
  },
  { _id: false }
);

const itemSchema = new Schema(
  {
    type: { type: String, enum: ["folder", "memo"], required: true, index: true },
    name: { type: String, required: true },
    path: { type: String, required: true }, // 例: /2025/7月/七夕賞
    parent: { type: Schema.Types.ObjectId, ref: "Item", default: null, index: true },
    ancestors: { type: [Schema.Types.ObjectId], default: [], index: true },
    depth: { type: Number, required: true, default: 0 },

    // 所有者: users._id を参照（Firebase UIDではなくMongoのUserドキュメントを参照）
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // memo 用
    horses: { type: [horseSchema], default: [] },
  },
  { timestamps: true }
);

// 同一ユーザー内で path をユニークに
itemSchema.index({ owner: 1, path: 1 }, { unique: true });

// 祖先ツリー探索用
itemSchema.index({ owner: 1, ancestors: 1 });

// メモだけ高速に一覧
itemSchema.index({ owner: 1, type: 1, createdAt: -1 });

export type ItemDoc = typeof itemSchema extends infer S
  ? S extends Schema ? InstanceType<(typeof models)["Item"]> : any
  : any;

export default models.Item || model("Item", itemSchema);

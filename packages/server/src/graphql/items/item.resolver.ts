import { GraphQLError } from "graphql";
import Item from "../../models/Item.js";
import User from "../../models/User.js";

const ALLOWED_MARKS = new Set([
  "HONMEI","TAIKOU","TANNANA","RENSHITA","HOSHI","CHUUI","KESHI","MUZIRUSHI",
]);

type FieldDoc = { label: string; type: string; value: unknown };
type HorseDoc = { fields?: FieldDoc[] };

const normalizeMark = (v: unknown) => {
  const mark = (v ?? "MUZIRUSHI").toString().toUpperCase();
  if (!ALLOWED_MARKS.has(mark)) throw new GraphQLError("INVALID_PREDICTION_MARK");
  return mark;
};

const normalizeName = (v: unknown) => {
  if (typeof v !== "string") return "";
  const name = v.trim();
  if (name.length > 80) throw new GraphQLError("HORSE_NAME_TOO_LONG");
  return name;
};

const normalizeFieldType = (v: unknown) => {
  const t = String(v).toUpperCase();
  if (!["NUMBER","SELECT","COMMENT"].includes(t)) throw new GraphQLError("INVALID_FIELD_TYPE");
  return t as "NUMBER"|"SELECT"|"COMMENT";
};

const requireUserId = async (ctx: any) => {
  if (!ctx?.user?.uid) throw new GraphQLError("UNAUTHENTICATED");
  const uid = ctx.user.uid as string;
  
  const user = await User.findOne({ uid });
  if (!user) throw new GraphQLError("USER_NOT_FOUND");
  
  return user._id;
};

const toSegment = (name: string) => name.trim().replace(/\//g, "-");
const joinPath = (parentPath: string | null, name: string) =>
  parentPath ? `${parentPath}/${toSegment(name)}` : `/${toSegment(name)}`;

export default {
  Query: {
    myItems: async (_: unknown, { parentId }: { parentId?: string | null }, ctx: any) => {
      const userId = await requireUserId(ctx);

      const q: any = { owner: userId };
      if (parentId === undefined || parentId === null || parentId === "") {
        q.parent = null;
      } else {
        q.parent = parentId;
      }

      return Item.find(q).sort({ type: 1, createdAt: -1 });
    },

    item: async (_: unknown, { id }: { id: string }, ctx: any) => {
      const userId = await requireUserId(ctx);
      return Item.findOne({ _id: id, owner: userId });
    },

    itemByPath: async (_: unknown, { path }: { path: string }, ctx: any) => {
      const userId = await requireUserId(ctx);
      const doc = await Item.findOne({ owner: userId, path });
      if (!doc) return null;

      return doc;
    },

    myRecentMemos: async (_: unknown, { limit = 20 }: { limit?: number }, ctx: any) => {
      const userId = await requireUserId(ctx);
      const n = Math.max(1, Math.min(limit, 100));
      return Item.find({ owner: userId, type: "MEMO" })
        .sort({ updatedAt: -1 })
        .limit(n);
    },
  },

  Mutation: {
    createFolder: async (_: unknown, { input }: any, ctx: any) => {
      const userId = await requireUserId(ctx);

      let parentDoc: any = null;
      let ancestors: any[] = [];
      let depth = 0;
      let parentPath: string | null = null;

      if (input.parentId) {
        parentDoc = await Item.findOne({ _id: input.parentId, owner: userId });
        if (!parentDoc) throw new GraphQLError("PARENT_NOT_FOUND");
        if (parentDoc.type !== "FOLDER") throw new GraphQLError("PARENT_MUST_BE_FOLDER");

        ancestors = [...(parentDoc.ancestors || []), parentDoc._id];
        depth = (parentDoc.depth || 0) + 1;
        parentPath = parentDoc.path;
      }

      const path = joinPath(parentPath, input.name);

      try {
        const doc = await Item.create({
          type: "FOLDER",
          name: input.name,
          path,
          parent: parentDoc?._id ?? null,
          ancestors,
          depth,
          owner: userId,
          horses: [],
        });
        return doc;
      } catch (e: any) {
        if (e?.code === 11000) throw new GraphQLError("PATH_EXISTS");
        throw e;
      }
    },

    createMemo: async (_: unknown, { input }: any, ctx: any) => {
      const userId = await requireUserId(ctx);

      let parentDoc: any = null;
      let ancestors: any[] = [];
      let depth = 0;
      let parentPath: string | null = null;

      if (input.parentId) {
        parentDoc = await Item.findOne({ _id: input.parentId, owner: userId });
        if (!parentDoc) throw new GraphQLError("PARENT_NOT_FOUND");
        if (parentDoc.type !== "FOLDER") throw new GraphQLError("PARENT_MUST_BE_FOLDER");

        ancestors = [...(parentDoc.ancestors || []), parentDoc._id];
        depth = (parentDoc.depth || 0) + 1;
        parentPath = parentDoc.path;
      }

      const path = joinPath(parentPath, input.name);

      const horses = (input.horses || []).map((h: any) => {
        const name = normalizeName(h?.name);
        const predictionMark = normalizeMark(h?.predictionMark);

        const fields = (h?.fields || []).map((f: any) => {
          if (!f?.label || !f?.type) throw new GraphQLError("FIELD_LABEL_AND_TYPE_REQUIRED");
          return {
            label: f.label,
            type: f.type.toString().toUpperCase(),
            value: f.value ?? null,
          };
        });

        return { name, predictionMark, fields };
      });

      try {
        const doc = await Item.create({
          type: "MEMO",
          name: input.name,
          path,
          parent: parentDoc?._id ?? null,
          ancestors,
          depth,
          owner: userId,
          horses,
        });
        return doc;
      } catch (e: any) {
        if (e?.code === 11000) throw new GraphQLError("PATH_EXISTS");
        throw e;
      }
    },
     async setHorseProp(_: any, { memoId, index, name, predictionMark }: {
      memoId: string; index: number; name?: string; predictionMark?: string;
    }, ctx: any) {
      const owner = await requireUserId(ctx);
      if (index < 0) throw new GraphQLError("INDEX_OUT_OF_RANGE");

      const doc = await Item.findOne({ _id: memoId, owner, type: "MEMO" });
      if (!doc) throw new GraphQLError("MEMO_NOT_FOUND");
      if (!Array.isArray(doc.horses) || index >= doc.horses.length) {
        throw new GraphQLError("INDEX_OUT_OF_RANGE");
      }

      if (name !== undefined) {
        doc.horses[index].name = normalizeName(name);
      }
      if (predictionMark !== undefined) {
        doc.horses[index].predictionMark = normalizeMark(predictionMark);
      }

      await doc.save();
      return doc;
    },

    async setHorseFieldValue(
      _: any,
      { memoId, index, label, type, value }: {
        memoId: string; index: number; label: string; type: string; value: any;
      },
      ctx: any
    ) {
      const owner = await requireUserId(ctx);
      if (index < 0) throw new GraphQLError("INDEX_OUT_OF_RANGE");

      const doc = await Item.findOne({ _id: memoId, owner, type: "MEMO" });
      if (!doc) throw new GraphQLError("MEMO_NOT_FOUND");
      if (!Array.isArray(doc.horses) || index >= doc.horses.length) {
        throw new GraphQLError("INDEX_OUT_OF_RANGE");
      }

      const horse = doc.horses[index];

      const normLabel = (label ?? "").toString().trim();
      if (!normLabel) throw new GraphQLError("FIELD_LABEL_REQUIRED");

      const normType = normalizeFieldType(type);

      type HorseField = { label: string; type: string; value: any | null };

      const fields: HorseField[] = Array.isArray(horse.fields)
        ? (horse.fields as HorseField[])
        : (horse.fields = [] as unknown as HorseField[]);

      const i = fields.findIndex((f) => f.label === normLabel);

      if (i >= 0) {
        const savedType = String(fields[i].type).toUpperCase();
        if (savedType !== normType) throw new GraphQLError("FIELD_TYPE_MISMATCH");
        fields[i].value = value ?? null;
      } else {
        fields.push({ label: normLabel, type: normType, value: value ?? null });
      }

      doc.markModified("horses");
      await doc.save();
      return doc;
    },
   async addFieldToMemo(
      _: unknown,
      { memoId, label, type }: { memoId: string; label: string; type: string },
      ctx: any
    ) {
      const owner = await requireUserId(ctx);

      const normLabel = (label ?? "").toString().trim();
      if (!normLabel) throw new GraphQLError("FIELD_LABEL_REQUIRED");
      if (normLabel.length > 40) throw new GraphQLError("FIELD_LABEL_TOO_LONG");

      const normType = normalizeFieldType(type);

      const doc = await Item.findOne({ _id: memoId, owner, type: "MEMO" });
      if (!doc) throw new GraphQLError("MEMO_NOT_FOUND");

      const horses: HorseDoc[] = Array.isArray(doc.horses) ? (doc.horses as HorseDoc[]) : [];

      const exists = horses.some((h: HorseDoc) =>
        (h.fields ?? []).some((f: FieldDoc) => String(f.label) === normLabel)
      );
      if (exists) throw new GraphQLError("FIELD_LABEL_EXISTS");

      horses.forEach((horse: HorseDoc) => {
        if (!Array.isArray(horse.fields)) horse.fields = [];
        horse.fields.push({ label: normLabel, type: normType, value: null });
      });

      doc.markModified("horses");
      await doc.save();
      return doc;
    }
  },
};

import { GraphQLError } from "graphql";
import Item from "../../models/Item.js";
import User from "../../models/User.js";
import type {
  QueryMyItemsArgs,
  QueryItemArgs,
  QueryItemByPathArgs,
  QueryMyRecentMemosArgs,
  MutationCreateFolderArgs,
  MutationCreateMemoArgs,
  MutationDeleteItemArgs,
  MutationSetHorsePropArgs,
  MutationSetHorseFieldValueArgs,
  MutationAddFieldToMemoArgs,
  MutationUpdateItemArgs,
  FieldType,
  Resolvers
} from "../../types/generated.js";

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

const normalizeFieldType = (v: unknown): FieldType => {
  const t = String(v).toUpperCase();
  if (!["NUMBER","SELECT","COMMENT"].includes(t)) throw new GraphQLError("INVALID_FIELD_TYPE");
  return t as FieldType;
};

interface Context {
  user?: {
    uid: string;
  };
}

const requireUserId = async (ctx: Context) => {
  if (!ctx?.user?.uid) throw new GraphQLError("UNAUTHENTICATED");
  const uid = ctx.user.uid as string;
  
  const user = await User.findOne({ uid });
  if (!user) throw new GraphQLError("USER_NOT_FOUND");
  
  return user._id;
};

const toSegment = (name: string) => name.trim().replace(/\//g, "-");
const joinPath = (parentPath: string | null, name: string) =>
  parentPath ? `${parentPath}/${toSegment(name)}` : `/${toSegment(name)}`;

const resolvers: Resolvers<Context> = {
  Query: {
    myItems: async (_, { parentId }: QueryMyItemsArgs, ctx: Context) => {
      const userId = await requireUserId(ctx);

      const q: Record<string, unknown> = { owner: userId };
      if (parentId === undefined || parentId === null || parentId === "") {
        q.parent = null;
      } else {
        q.parent = parentId;
      }

      return Item.find(q).sort({ type: 1, createdAt: -1 });
    },

    item: async (_, { id }: QueryItemArgs, ctx: Context) => {
      const userId = await requireUserId(ctx);
      return Item.findOne({ _id: id, owner: userId });
    },

    itemByPath: async (_, { path }: QueryItemByPathArgs, ctx: Context) => {
      const userId = await requireUserId(ctx);
      const doc = await Item.findOne({ owner: userId, path });
      if (!doc) return null;

      return doc;
    },

    myRecentMemos: async (_, { limit }: QueryMyRecentMemosArgs, ctx: Context) => {
      const userId = await requireUserId(ctx);
      const normalizedLimit = limit ?? 20;
      const n = Math.max(1, Math.min(normalizedLimit, 100));
      return Item.find({ owner: userId, type: "MEMO" })
        .sort({ updatedAt: -1 })
        .limit(n);
    },
  },

  Mutation: {
    createFolder: async (_, { input }: MutationCreateFolderArgs, ctx: Context) => {
      const userId = await requireUserId(ctx);

      let parentDoc: typeof Item.prototype | null = null;
      let ancestors: string[] = [];
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
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 11000) throw new GraphQLError("PATH_EXISTS");
        throw e;
      }
    },

    createMemo: async (_, { input }: MutationCreateMemoArgs, ctx: Context) => {
      const userId = await requireUserId(ctx);

      let parentDoc: typeof Item.prototype | null = null;
      let ancestors: string[] = [];
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

      const horses = (input.horses || []).map((h) => {
        const name = normalizeName(h?.name);
        const predictionMark = normalizeMark(h?.predictionMark);

        const fields = (h?.fields || []).map((f) => {
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
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 11000) throw new GraphQLError("PATH_EXISTS");
        throw e;
      }
    },

    deleteItem: async (_, { id }: MutationDeleteItemArgs, ctx: Context) => {
      const owner = await requireUserId(ctx);

      const deletedItem = await Item.findOneAndDelete({ _id: id, owner});
      if (!deletedItem) {
        return { success: false, deletedId: id, deletedItem: null };
      }
      return { success: true, deletedId: id, deletedItem };

    },

    updateItem: async (_, { input }: MutationUpdateItemArgs, ctx: Context) => {
      const userId = await requireUserId(ctx);
      
      const item = await Item.findOne({ _id: input.id, owner: userId });
      if (!item) {
        return { success: false, updatedItem: null };
      }

      if (input.name !== undefined && input.name !== null) {
        item.name = input.name;
        
        const parentPath = item.parent 
          ? (await Item.findById(item.parent))?.path || null 
          : null;
        item.path = joinPath(parentPath, input.name);
      }

      if (input.parentId !== undefined) {
        if (input.parentId === null) {
          item.parent = null;
          item.ancestors = [];
          item.depth = 0;
          if (input.name) {
            item.path = joinPath(null, input.name);
          }
        } else {
          const parentDoc = await Item.findOne({ _id: input.parentId, owner: userId });
          if (!parentDoc) throw new GraphQLError("PARENT_NOT_FOUND");
          if (parentDoc.type !== "FOLDER") throw new GraphQLError("PARENT_MUST_BE_FOLDER");
          
          item.parent = parentDoc._id;
          item.ancestors = [...(parentDoc.ancestors || []), parentDoc._id];
          item.depth = (parentDoc.depth || 0) + 1;
          if (input.name) {
            item.path = joinPath(parentDoc.path, input.name);
          }
        }
      }

      if (input.horses !== undefined && input.horses !== null && item.type === "MEMO") {
        const horses = input.horses.map((h) => {
          const name = normalizeName(h?.name);
          const predictionMark = normalizeMark(h?.predictionMark);

          const fields = (h?.fields || []).map((f) => {
            if (!f?.label || !f?.type) throw new GraphQLError("FIELD_LABEL_AND_TYPE_REQUIRED");
            return {
              label: f.label,
              type: f.type.toString().toUpperCase(),
              value: f.value ?? null,
            };
          });

          return { name, predictionMark, fields };
        });
        item.horses = horses;
      }

      try {
        const updatedItem = await item.save();
        return { success: true, updatedItem };
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 11000) {
          throw new GraphQLError("PATH_EXISTS");
        }
        throw e;
      }
    },

    async setHorseProp(_, { memoId, index, name, predictionMark }: MutationSetHorsePropArgs, ctx: Context) {
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
      _,
      { memoId, index, label, type, value }: MutationSetHorseFieldValueArgs,
      ctx: Context
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

      type HorseField = { label: string; type: string; value: unknown | null };

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
      _,
      { memoId, label, type }: MutationAddFieldToMemoArgs,
      ctx: Context
    ) {
      const owner = await requireUserId(ctx);

      const normLabel = (label ?? "").toString().trim();
      if (!normLabel) throw new GraphQLError("FIELD_LABEL_REQUIRED");
      if (normLabel.length > 40) throw new GraphQLError("FIELD_LABEL_TOO_LONG");

      const normType = normalizeFieldType(type);

      const doc = await Item.findOne({ _id: memoId, owner, type: "MEMO" });
      if (!doc) throw new GraphQLError("MEMO_NOT_FOUND");

      const horses: HorseDoc[] = Array.isArray(doc.horses) ? doc.horses as HorseDoc[] : [];

      const exists = horses.some((h: HorseDoc) =>
        (h.fields ?? []).some((f: FieldDoc) => String(f.label) === normLabel)
      );
      if (exists) throw new GraphQLError("FIELD_LABEL_EXISTS");

      horses.forEach((horse: HorseDoc) => {
        if (!Array.isArray(horse.fields)) horse.fields = [];
        (horse.fields as FieldDoc[]).push({ label: normLabel, type: normType, value: null });
      });

      doc.markModified("horses");
      await doc.save();
      return doc;
    }
  },
};

export default resolvers;

import { GraphQLError } from "graphql";
import Item from "../../models/Item.js";
import User from "../../models/User.js";

const requireUserId = async (ctx: any) => {
  if (!ctx?.user?.uid) throw new GraphQLError("UNAUTHENTICATED");
  const uid = ctx.user.uid as string;
  
  // Firebase UIDからUser documentのObjectIdを取得
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
        if (!h?.name || !h?.predictionMark) {
          throw new GraphQLError("HORSE_NAME_AND_MARK_REQUIRED");
        }
        const fields = (h.fields || []).map((f: any) => {
          if (!f?.label || !f?.type) throw new GraphQLError("FIELD_LABEL_AND_TYPE_REQUIRED");
          // f.type は "number" | "select" | "comment" を想定
          return { label: f.label, type: f.type.toUpperCase(), value: f.value ?? null };
        });
        return { name: h.name, predictionMark: h.predictionMark, fields };
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
  },
};

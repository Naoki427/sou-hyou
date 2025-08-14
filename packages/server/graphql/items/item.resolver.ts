import { GraphQLError } from "graphql";
import Item from "../../models/Item.js";
import User from "../../models/User.js";

const requireUid = (ctx: any) => {
  if (!ctx?.user?.uid) throw new GraphQLError("UNAUTHENTICATED");
  return ctx.user.uid as string;
};

// name から path セグメントを作る（スラッシュ除去 & 前後空白トリム）
const toSegment = (name: string) => name.trim().replace(/\//g, "-");

const joinPath = (parentPath: string | null, name: string) =>
  parentPath ? `${parentPath}/${toSegment(name)}` : `/${toSegment(name)}`;

const toFieldTypeString = (t: "NUMBER" | "SELECT" | "COMMENT") =>
  t.toLowerCase(); // "number" | "select" | "comment"

export default {
  Query: {
    myItems: async (_: unknown, { parentId }: { parentId?: string | null }, ctx: any) => {
      const uid = requireUid(ctx);
      const owner = await User.findOne({ uid });
      if (!owner) throw new GraphQLError("USER_NOT_FOUND");

      const q: any = { owner: owner._id };
      if (parentId === undefined || parentId === null || parentId === "") {
        q.parent = null;
      } else {
        q.parent = parentId;
      }

      return Item.find(q).sort({ type: 1, createdAt: -1 });
    },

    item: async (_: unknown, { id }: { id: string }, ctx: any) => {
      const uid = requireUid(ctx);
      const owner = await User.findOne({ uid });
      if (!owner) throw new GraphQLError("USER_NOT_FOUND");

      return Item.findOne({ _id: id, owner: owner._id });
    },
  },

  Mutation: {
    createFolder: async (_: unknown, { input }: any, ctx: any) => {
      const uid = requireUid(ctx);
      const owner = await User.findOne({ uid });
      if (!owner) throw new GraphQLError("USER_NOT_FOUND");

      let parentDoc: any = null;
      let ancestors: any[] = [];
      let depth = 0;
      let parentPath: string | null = null;

      if (input.parentId) {
        parentDoc = await Item.findOne({ _id: input.parentId, owner: owner._id });
        if (!parentDoc) throw new GraphQLError("PARENT_NOT_FOUND");
        if (parentDoc.type !== "folder") throw new GraphQLError("PARENT_MUST_BE_FOLDER");

        ancestors = [...(parentDoc.ancestors || []), parentDoc._id];
        depth = (parentDoc.depth || 0) + 1;
        parentPath = parentDoc.path;
      }

      const path = joinPath(parentPath, input.name);

      try {
        const doc = await Item.create({
          type: "folder",
          name: input.name,
          path,
          parent: parentDoc?._id ?? null,
          ancestors,
          depth,
          owner: owner._id,
          horses: [],
        });
        return doc;
      } catch (e: any) {
        if (e?.code === 11000) throw new GraphQLError("PATH_EXISTS");
        throw e;
      }
    },

    createMemo: async (_: unknown, { input }: any, ctx: any) => {
      const uid = requireUid(ctx);
      const owner = await User.findOne({ uid });
      if (!owner) throw new GraphQLError("USER_NOT_FOUND");

      let parentDoc: any = null;
      let ancestors: any[] = [];
      let depth = 0;
      let parentPath: string | null = null;

      if (input.parentId) {
        parentDoc = await Item.findOne({ _id: input.parentId, owner: owner._id });
        if (!parentDoc) throw new GraphQLError("PARENT_NOT_FOUND");
        if (parentDoc.type !== "folder") throw new GraphQLError("PARENT_MUST_BE_FOLDER");

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
          return {
            label: f.label,
            type: toFieldTypeString(f.type),
            value: f.value ?? null,
          };
        });
        return { name: h.name, predictionMark: h.predictionMark, fields };
      });

      try {
        const doc = await Item.create({
          type: "memo",
          name: input.name,
          path,
          parent: parentDoc?._id ?? null,
          ancestors,
          depth,
          owner: owner._id,
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

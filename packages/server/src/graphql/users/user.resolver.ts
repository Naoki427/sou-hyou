import { GraphQLError } from "graphql";
import User from "../../models/User.js";
import { getFirebaseAuth } from "../../services/firebaseAdmin.js";

/** 認証必須ヘルパ */
const requireUid = (ctx: any) => {
  if (!ctx?.user?.uid) throw new GraphQLError("UNAUTHENTICATED");
  return ctx.user.uid as string;
};

export default {
  Query: {
    /** 現在ユーザーを返す（Mongo の users から） */
    me: async (_: unknown, __: unknown, ctx: any) => {
      const uid = requireUid(ctx);
      const u = await User.findOne({ uid });
      if (!u) return null;
      // Mongoose ドキュメントをそのまま返しても OK だが、明示的に整形
      return {
        id: u._id.toString(),
        uid: u.uid,
        email: u.email ?? null,
        name: u.name ?? null,
        photoURL: u.photoURL ?? null,
        createdAt: u.createdAt?.toISOString?.() ?? null,
        updatedAt: u.updatedAt?.toISOString?.() ?? null,
      };
    },
  },

  Mutation: {
    /** プロフィール更新（表示名/アイコン）。Mongo を更新し、可能なら Firebase 側も更新 */
    updateMe: async (_: unknown, { input }: { input: { displayName?: string; photoURL?: string } }, ctx: any) => {
      const uid = requireUid(ctx);

      const $set: Record<string, any> = {};
      if (typeof input.displayName === "string") $set.name = input.displayName;
      if (typeof input.photoURL === "string") $set.photoURL = input.photoURL;

      // 変更がない場合はそのまま返す
      if (Object.keys($set).length === 0) {
        const current = await User.findOne({ uid });
        if (!current) throw new GraphQLError("USER_NOT_FOUND");
        return {
          id: current._id.toString(),
          uid: current.uid,
          email: current.email ?? null,
          name: current.name ?? null,
          photoURL: current.photoURL ?? null,
          createdAt: current.createdAt?.toISOString?.() ?? null,
          updatedAt: current.updatedAt?.toISOString?.() ?? null,
        };
      }

      // Mongo 更新
      const doc = await User.findOneAndUpdate(
        { uid },
        { $set },
        { new: true }
      );
      if (!doc) throw new GraphQLError("USER_NOT_FOUND");

      // Firebase 側も可能なら更新（失敗しても致命にはしない）
      try {
        await getFirebaseAuth().updateUser(uid, {
          displayName: input.displayName ?? undefined,
          photoURL: input.photoURL ?? undefined,
        });
      } catch (e) {
        console.warn("update firebase user failed:", (e as Error).message);
      }

      return {
        id: doc._id.toString(),
        uid: doc.uid,
        email: doc.email ?? null,
        name: doc.name ?? null,
        photoURL: doc.photoURL ?? null,
        createdAt: doc.createdAt?.toISOString?.() ?? null,
        updatedAt: doc.updatedAt?.toISOString?.() ?? null,
      };
    },
  },
};

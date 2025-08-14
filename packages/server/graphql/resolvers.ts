// import User from "../models/User.js";

// export const resolvers = {
//   Query: {
//     health: () => "ok",
//     me: async (_: unknown, __: unknown, ctx: { user?: { uid: string } }) => {
//       if (!ctx.user) return null;
//       return await User.findOne({ uid: ctx.user.uid });
//     },
//   },
// };

import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireUser } from "./model";

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (user.orgId) throw new Error("You already belong to an organization");
    const name = args.name.trim();
    if (!name) throw new Error("Organization name is required");
    const orgId = await ctx.db.insert("organizations", {
      name,
      createdByClerkId: user.clerkId,
    });
    await ctx.db.patch(user._id, { orgId, role: "admin" });
    return orgId;
  },
});

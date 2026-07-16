import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./model";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    const members = await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", admin.orgId!))
      .collect();
    return await Promise.all(
      members.map(async (member) => ({
        ...member,
        jobsite: member.jobsiteId ? await ctx.db.get(member.jobsiteId) : null,
      })),
    );
  },
});

export const setJobsite = mutation({
  args: { userId: v.id("users"), jobsiteId: v.optional(v.id("jobsites")) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const member = await ctx.db.get(args.userId);
    if (!member || member.orgId !== admin.orgId) {
      throw new Error("Member not found");
    }
    if (args.jobsiteId) {
      const jobsite = await ctx.db.get(args.jobsiteId);
      if (!jobsite || jobsite.orgId !== admin.orgId) {
        throw new Error("Jobsite not found");
      }
    }
    await ctx.db.patch(args.userId, { jobsiteId: args.jobsiteId });
  },
});

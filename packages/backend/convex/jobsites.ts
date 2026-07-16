import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireMember } from "./model";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireMember(ctx);
    return await ctx.db
      .query("jobsites")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId!))
      .collect();
  },
});

export const create = mutation({
  args: { name: v.string(), address: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Jobsite name is required");
    return await ctx.db.insert("jobsites", {
      orgId: admin.orgId!,
      name,
      address: args.address.trim(),
    });
  },
});

export const update = mutation({
  args: { id: v.id("jobsites"), name: v.string(), address: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const jobsite = await ctx.db.get(args.id);
    if (!jobsite || jobsite.orgId !== admin.orgId) {
      throw new Error("Jobsite not found");
    }
    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      address: args.address.trim(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("jobsites") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const jobsite = await ctx.db.get(args.id);
    if (!jobsite || jobsite.orgId !== admin.orgId) {
      throw new Error("Jobsite not found");
    }
    // Unassign members pointing at this jobsite; past invoices keep the id
    // for history and render "—" once the jobsite is gone.
    const members = await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", admin.orgId!))
      .collect();
    for (const member of members) {
      if (member.jobsiteId === args.id) {
        await ctx.db.patch(member._id, { jobsiteId: undefined });
      }
    }
    await ctx.db.delete(args.id);
  },
});

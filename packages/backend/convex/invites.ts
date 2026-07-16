import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./model";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    const invites = await ctx.db
      .query("invites")
      .withIndex("by_org", (q) => q.eq("orgId", admin.orgId!))
      .collect();
    return await Promise.all(
      invites.map(async (invite) => ({
        ...invite,
        jobsite: invite.jobsiteId ? await ctx.db.get(invite.jobsiteId) : null,
      })),
    );
  },
});

export const create = mutation({
  args: { email: v.string(), jobsiteId: v.optional(v.id("jobsites")) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const email = args.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address");
    }
    if (args.jobsiteId) {
      const jobsite = await ctx.db.get(args.jobsiteId);
      if (!jobsite || jobsite.orgId !== admin.orgId) {
        throw new Error("Jobsite not found");
      }
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existingUser?.orgId) {
      if (existingUser.orgId === admin.orgId) {
        throw new Error("This person is already in your organization");
      }
      throw new Error("This email already belongs to another organization");
    }

    const existingInvite = await ctx.db
      .query("invites")
      .withIndex("by_email", (q) => q.eq("email", email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();
    if (existingInvite) throw new Error("This email already has a pending invite");

    const inviteId = await ctx.db.insert("invites", {
      orgId: admin.orgId!,
      email,
      jobsiteId: args.jobsiteId,
      invitedByClerkId: admin.clerkId,
      status: "pending",
    });

    // If they already signed up (no org yet), connect them immediately.
    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        orgId: admin.orgId,
        role: "member",
        jobsiteId: args.jobsiteId,
      });
      await ctx.db.patch(inviteId, { status: "accepted" });
    }
    return inviteId;
  },
});

export const revoke = mutation({
  args: { id: v.id("invites") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const invite = await ctx.db.get(args.id);
    if (!invite || invite.orgId !== admin.orgId) {
      throw new Error("Invite not found");
    }
    if (invite.status !== "pending") {
      throw new Error("Only pending invites can be revoked");
    }
    await ctx.db.delete(args.id);
  },
});

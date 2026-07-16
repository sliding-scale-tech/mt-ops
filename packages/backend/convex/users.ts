import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { applyPendingInvite, getCurrentUser, getUserByClerkId } from "./model";

/**
 * Current user's record plus org context, for routing the frontend
 * (admin portal vs worker dashboard vs onboarding).
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const org = user.orgId ? await ctx.db.get(user.orgId) : null;
    const jobsite = user.jobsiteId ? await ctx.db.get(user.jobsiteId) : null;
    return { ...user, org, jobsite };
  },
});

/**
 * Called on app load for signed-in users. Creates the users record if the
 * Clerk webhook hasn't landed yet, and attaches any pending invite.
 */
export const ensureCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    let user = await getUserByClerkId(ctx, identity.subject);
    if (!user) {
      const id = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: (identity.email ?? "").toLowerCase(),
        name: identity.name ?? identity.email ?? undefined,
        imageUrl: identity.pictureUrl ?? undefined,
      });
      user = (await ctx.db.get(id))!;
    }
    return await applyPendingInvite(ctx, user);
  },
});

/** Upsert from Clerk webhook (user.created / user.updated). */
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    let user = await getUserByClerkId(ctx, args.clerkId);
    if (user) {
      await ctx.db.patch(user._id, {
        email,
        // The app owns the display name once set (Settings page)
        name: user.name ?? args.name,
        imageUrl: args.imageUrl,
      });
      user = (await ctx.db.get(user._id))!;
    } else {
      const id = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      user = (await ctx.db.get(id))!;
    }
    await applyPendingInvite(ctx, user);
  },
});

/** Update the current user's display name (Settings page). */
export const updateName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error("User not found");
    const name = args.name.trim();
    if (!name) throw new Error("Name is required");
    await ctx.db.patch(user._id, { name });
  },
});

/** Delete from Clerk webhook (user.deleted). */
export const deleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);
    if (user) await ctx.db.delete(user._id);
  },
});

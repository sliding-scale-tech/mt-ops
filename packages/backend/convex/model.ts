import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function getUserByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await getUserByClerkId(ctx, identity.subject);
}

export async function requireUser(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireMember(ctx: QueryCtx) {
  const user = await requireUser(ctx);
  if (!user.orgId) throw new Error("Not part of an organization");
  return user as Doc<"users"> & { orgId: Doc<"users">["orgId"] & {} };
}

export async function requireAdmin(ctx: QueryCtx) {
  const user = await requireMember(ctx);
  if (user.role !== "admin") throw new Error("Admin access required");
  return user;
}

/**
 * Attach a user with no organization to the org that invited their email,
 * if a pending invite exists. Marks the invite accepted.
 */
export async function applyPendingInvite(ctx: MutationCtx, user: Doc<"users">) {
  if (user.orgId) return user;
  const invite = await ctx.db
    .query("invites")
    .withIndex("by_email", (q) => q.eq("email", user.email.toLowerCase()))
    .filter((q) => q.eq(q.field("status"), "pending"))
    .first();
  if (!invite) return user;
  await ctx.db.patch(user._id, {
    orgId: invite.orgId,
    role: "member",
    jobsiteId: invite.jobsiteId,
  });
  await ctx.db.patch(invite._id, { status: "accepted" });
  return (await ctx.db.get(user._id))!;
}

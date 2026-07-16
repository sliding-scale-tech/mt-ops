import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireMember } from "./model";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireMember(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const submit = mutation({
  args: {
    fileId: v.id("_storage"),
    fileName: v.string(),
    month: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireMember(ctx);
    if (!/^\d{4}-\d{2}$/.test(args.month)) {
      throw new Error("Invalid month");
    }
    if (args.amount !== undefined && (!Number.isFinite(args.amount) || args.amount < 0)) {
      throw new Error("Invalid amount");
    }
    return await ctx.db.insert("invoices", {
      orgId: user.orgId!,
      userId: user._id,
      jobsiteId: user.jobsiteId,
      month: args.month,
      amount: args.amount,
      fileId: args.fileId,
      fileName: args.fileName,
      status: "pending",
    });
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireMember(ctx);
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    return await Promise.all(
      invoices.map(async (invoice) => ({
        ...invoice,
        jobsite: invoice.jobsiteId ? await ctx.db.get(invoice.jobsiteId) : null,
        fileUrl: await ctx.storage.getUrl(invoice.fileId),
      })),
    );
  },
});

export const listForOrg = query({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("orgId", admin.orgId!))
      .order("desc")
      .collect();
    return await Promise.all(
      invoices.map(async (invoice) => {
        const user = await ctx.db.get(invoice.userId);
        return {
          ...invoice,
          worker: user ? { name: user.name, email: user.email } : null,
          jobsite: invoice.jobsiteId ? await ctx.db.get(invoice.jobsiteId) : null,
          fileUrl: await ctx.storage.getUrl(invoice.fileId),
        };
      }),
    );
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("invoices"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const invoice = await ctx.db.get(args.id);
    if (!invoice || invoice.orgId !== admin.orgId) {
      throw new Error("Invoice not found");
    }
    await ctx.db.patch(args.id, {
      status: args.status,
      reviewedAt: args.status === "pending" ? undefined : Date.now(),
    });
  },
});

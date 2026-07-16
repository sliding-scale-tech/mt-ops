import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    createdByClerkId: v.string(),
  }),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    orgId: v.optional(v.id("organizations")),
    role: v.optional(v.union(v.literal("admin"), v.literal("member"))),
    jobsiteId: v.optional(v.id("jobsites")),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_org", ["orgId"]),

  invites: defineTable({
    orgId: v.id("organizations"),
    email: v.string(),
    jobsiteId: v.optional(v.id("jobsites")),
    invitedByClerkId: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted")),
  })
    .index("by_email", ["email"])
    .index("by_org", ["orgId"]),

  jobsites: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    address: v.string(),
  }).index("by_org", ["orgId"]),

  invoices: defineTable({
    orgId: v.id("organizations"),
    userId: v.id("users"),
    jobsiteId: v.optional(v.id("jobsites")),
    month: v.string(), // "YYYY-MM"
    amount: v.optional(v.number()),
    fileId: v.id("_storage"),
    fileName: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_org", ["orgId"])
    .index("by_org_status", ["orgId", "status"])
    .index("by_user", ["userId"]),
});

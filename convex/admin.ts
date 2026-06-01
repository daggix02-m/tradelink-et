import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertRole } from "./lib";

/** Admin revenue dashboard — totals that neither supplier nor buyer can ever see */
export const revenueSummary = query({
  args: {},
  handler: async (ctx) => {
    await assertRole(ctx, ["admin"]);

    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    const totalGMV = orders.reduce((s, o) => s + o.totalPaid, 0);
    const totalCommission = orders.reduce((s, o) => s + o.commissionEarned, 0);
    const totalPaidOut = orders.reduce((s, o) => s + o.supplierPayout, 0);
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

    return {
      totalGMV,
      totalCommission,
      totalPaidOut,
      deliveredOrders,
      totalOrders: orders.length,
      avgCommissionRate: totalGMV > 0 ? (totalCommission / totalGMV) * 100 : 0,
    };
  },
});

/** Admin: set or update commission rules */
export const upsertCommissionRule = mutation({
  args: {
    category:    v.optional(v.string()),
    ratePercent: v.number(),
    flatFeeEtb:  v.optional(v.number()),
    isDefault:   v.boolean(),
  },
  handler: async (ctx, args) => {
    const caller = await assertRole(ctx, ["admin"]);

    const existing = await ctx.db
      .query("commissionRules")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ratePercent: args.ratePercent,
        flatFeeEtb: args.flatFeeEtb,
        isDefault: args.isDefault,
        updatedBy: caller._id,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("commissionRules", {
        category: args.category,
        ratePercent: args.ratePercent,
        flatFeeEtb: args.flatFeeEtb,
        isDefault: args.isDefault,
        updatedBy: caller._id,
        updatedAt: Date.now(),
      });
    }
  },
});

/** Admin: get all commission rules */
export const listCommissionRules = query({
  args: {},
  handler: async (ctx) => {
    await assertRole(ctx, ["admin"]);
    return await ctx.db.query("commissionRules").collect();
  },
});

/** Admin: verify a user account */
export const verifyUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await assertRole(ctx, ["admin"]);
    await ctx.db.patch(userId, { verified: true });
  },
});

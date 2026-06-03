import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCallerUser, assertRole } from "./lib";

export const myOrders = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    const caller = await getCallerUser(ctx);

    let orders;
    if (caller.role === "importer") {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_supplier", (q) => q.eq("supplierId", caller._id))
        .collect();
      // Filter out commission data for importers
      orders = orders.map(({ commissionEarned, ...rest }) => ({
        ...rest,
        pricePerUnit: rest.unitPrice - rest.supplierPayout / rest.quantity,
        totalPaid: rest.supplierPayout,
      }));
    } else if (caller.role === "wholesaler") {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_buyer", (q) => q.eq("buyerId", caller._id))
        .collect();
      // Hide supplier payout and commission from the buyer
      orders = orders.map(({ supplierPayout, commissionEarned, ...rest }) => rest);
    } else {
      orders = await ctx.db.query("orders").collect();
    }

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    return orders;
  },
});

export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const caller = await getCallerUser(ctx);
    const order = await ctx.db.get(orderId);
    if (!order) return null;

    const [deal, supplier, buyer] = await Promise.all([
      ctx.db.get(order.dealId),
      ctx.db.get(order.supplierId),
      ctx.db.get(order.buyerId),
    ]);

    if (caller.role === "wholesaler") {
      const { supplierPayout, commissionEarned, ...safeOrder } = order;
      return {
        ...safeOrder,
        dealTitle: deal?.productId ? "Deal" : undefined,
      };
    }

    if (caller.role === "importer") {
      const { commissionEarned, ...rest } = order;
      return {
        ...rest,
        counterpartAlias:
          order.supplierId === caller._id
            ? buyer?.alias ?? "Buyer"
            : supplier?.alias ?? "Supplier",
      };
    }

    return {
      ...order,
      supplierAlias: supplier?.alias,
      supplierName: supplier?.displayName,
      buyerAlias: buyer?.alias,
      buyerName: buyer?.displayName,
    };
  },
});

export const createOrder = mutation({
  args: {
    dealId: v.id("deals"),
  },
  handler: async (ctx, { dealId }) => {
    const caller = await getCallerUser(ctx);
    const deal = await ctx.db.get(dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.status !== "agreed") throw new Error("Deal must be in 'agreed' status");

    const isParty =
      deal.supplierId === caller._id || deal.buyerId === caller._id;
    if (!isParty && caller.role !== "admin")
      throw new Error("Not party to this deal");

    const { displayPrice, commissionAmount, supplierPayout } = deal.agreedDisplayPrice
      ? {
          displayPrice: deal.agreedDisplayPrice,
          commissionAmount: deal.commissionAmount ?? 0,
          supplierPayout: deal.supplierPayout ?? 0,
        }
      : { displayPrice: 0, commissionAmount: 0, supplierPayout: 0 };

    const orderId = await ctx.db.insert("orders", {
      dealId,
      supplierId: deal.supplierId,
      buyerId: deal.buyerId,
      status: "pending_payment",
      quantity: deal.quantity,
      unitPrice: displayPrice,
      totalPaid: displayPrice * deal.quantity,
      supplierPayout,
      commissionEarned: commissionAmount * deal.quantity,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.patch(dealId, { status: "paid", updatedAt: Date.now() });

    await Promise.all([
      ctx.db.insert("notifications", {
        userId: deal.supplierId,
        type: "order_created",
        title: "New order placed",
        body: `Order for ${deal.quantity} units has been created.`,
        linkTo: `/importer/orders`,
        read: false,
        createdAt: Date.now(),
      }),
      ctx.db.insert("notifications", {
        userId: deal.buyerId,
        type: "order_created",
        title: "Order confirmed",
        body: `Your order for ${deal.quantity} units has been confirmed.`,
        linkTo: `/wholesaler/orders`,
        read: false,
        createdAt: Date.now(),
      }),
    ]);

    return orderId;
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, { orderId, status, trackingNumber }) => {
    const caller = await assertRole(ctx, ["importer", "admin"]);

    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    if (caller.role === "importer" && order.supplierId !== caller._id) {
      throw new Error("You can only update your own orders");
    }

    const updates: Record<string, unknown> = {
      status,
      updatedAt: Date.now(),
    };

    if (trackingNumber) updates.trackingNumber = trackingNumber;
    if (status === "delivered") updates.deliveredAt = Date.now();

    await ctx.db.patch(orderId, updates);
    await ctx.db.insert("notifications", {
      userId: order.buyerId,
      type: "order_update",
      title: `Order ${status}`,
      body: `Your order #${orderId.slice(-6)} has been marked as ${status}.`,
      linkTo: `/wholesaler/orders`,
      read: false,
      createdAt: Date.now(),
    });

    return orderId;
  },
});
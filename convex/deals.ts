import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCallerUser, assertRole, applyCommission } from "./lib";

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Get deals for the current user (commission-masked per role) */
export const myDeals = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    const caller = await getCallerUser(ctx);

    let deals;
    if (caller.role === "importer") {
      deals = await ctx.db
        .query("deals")
        .withIndex("by_supplier", (q) => q.eq("supplierId", caller._id))
        .collect();
    } else if (caller.role === "wholesaler") {
      deals = await ctx.db
        .query("deals")
        .withIndex("by_buyer", (q) => q.eq("buyerId", caller._id))
        .collect();
    } else {
      // Admin sees all deals
      deals = await ctx.db.query("deals").collect();
    }

    if (status) deals = deals.filter((d) => d.status === status);

    return Promise.all(
      deals.map(async (deal) => {
        const product = await ctx.db.get(deal.productId);
        const supplier = await ctx.db.get(deal.supplierId);
        const buyer = await ctx.db.get(deal.buyerId);

        const base = {
          ...deal,
          productTitle: product?.title,
          productUnit: product?.unit,
        };

        if (caller.role === "importer") {
          // Supplier sees their payout, NOT commission details, NOT buyer identity
          return {
            ...base,
            counterpartAlias: buyer?.alias ?? "Buyer",
            agreedPrice: deal.agreedRawPrice,         // their take-home price
            commissionAmount: undefined,              // hidden
            agreedDisplayPrice: undefined,            // hidden (buyer's price)
          };
        }

        if (caller.role === "wholesaler") {
          // Buyer sees the total they pay, NOT supplier identity, NOT commission
          return {
            ...base,
            counterpartAlias: supplier?.alias ?? "Supplier",
            agreedPrice: deal.agreedDisplayPrice,     // total they pay
            commissionAmount: undefined,              // hidden
            agreedRawPrice: undefined,                // hidden (supplier's price)
          };
        }

        // Admin sees everything
        return {
          ...base,
          supplierAlias: supplier?.alias,
          supplierName: supplier?.displayName,
          buyerAlias: buyer?.alias,
          buyerName: buyer?.displayName,
        };
      })
    );
  },
});

/** Get a single deal with messages (commission-masked) */
export const getDeal = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, { dealId }) => {
    const caller = await getCallerUser(ctx);
    const deal = await ctx.db.get(dealId);
    if (!deal) return null;

    // Ensure caller is party to this deal or admin
    const isParty =
      deal.supplierId === caller._id || deal.buyerId === caller._id;
    if (!isParty && caller.role !== "admin") {
      throw new Error("Access denied to this deal");
    }

    const product = await ctx.db.get(deal.productId);
    const supplier = await ctx.db.get(deal.supplierId);
    const buyer = await ctx.db.get(deal.buyerId);

    if (caller.role === "wholesaler") {
      const { agreedRawPrice: _r, commissionAmount: _c, supplierPayout: _s, ...safeDeal } = deal;
      return {
        ...safeDeal,
        counterpartAlias: supplier?.alias,
        productTitle: product?.title,
      };
    }

    if (caller.role === "importer") {
      const { commissionAmount: _c, agreedDisplayPrice: _d, ...safeDeal } = deal;
      return {
        ...safeDeal,
        counterpartAlias: buyer?.alias,
        productTitle: product?.title,
      };
    }

    // Admin
    return {
      ...deal,
      supplierAlias: supplier?.alias,
      supplierName: supplier?.displayName,
      buyerAlias: buyer?.alias,
      buyerName: buyer?.displayName,
      productTitle: product?.title,
    };
  },
});

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Wholesaler initiates a deal (enquiry) on a product */
export const initiateDeal = mutation({
  args: {
    productId: v.id("products"),
    quantity:  v.number(),
  },
  handler: async (ctx, { productId, quantity }) => {
    const caller = await assertRole(ctx, ["wholesaler"]);
    const product = await ctx.db.get(productId);
    if (!product || !product.isActive) throw new Error("Product not available");

    const dealId = await ctx.db.insert("deals", {
      productId,
      supplierId:  product.supplierId,
      buyerId:     caller._id,
      status:      "negotiating",
      quantity,
      createdAt:   Date.now(),
      updatedAt:   Date.now(),
    });

    // Auto-send a system message to open the thread
    await ctx.db.insert("messages", {
      dealId,
      senderId:  caller._id,
      content:   `Buyer ${caller.alias} has requested ${quantity} ${product.unit} of "${product.title}".`,
      type:      "system",
      readBy:    [caller._id],
      createdAt: Date.now(),
    });

    // Notify supplier
    await ctx.db.insert("notifications", {
      userId:    product.supplierId,
      type:      "new_deal",
      title:     "New enquiry received",
      body:      `${caller.alias} is interested in ${quantity} units of ${product.title}`,
      linkTo:    `/importer`,
      read:      false,
      createdAt: Date.now(),
    });

    return dealId;
  },
});

/**
 * Make a price offer within a deal.
 * Commission is injected server-side when creating the offer message.
 * The buyer sees displayPrice, the supplier sees their rawPrice portion.
 */
export const makeOffer = mutation({
  args: {
    dealId:       v.id("deals"),
    quantity:     v.number(),
    pricePerUnit: v.number(),   // caller's price:
                                //   importer = rawPrice they want
                                //   wholesaler = price they're willing to pay
    note:         v.optional(v.string()),
  },
  handler: async (ctx, { dealId, quantity, pricePerUnit, note }) => {
    const caller = await getCallerUser(ctx);
    const deal = await ctx.db.get(dealId);
    if (!deal) throw new Error("Deal not found");

    const isParty = deal.supplierId === caller._id || deal.buyerId === caller._id;
    if (!isParty) throw new Error("Not party to this deal");

    const product = await ctx.db.get(deal.productId);
    if (!product) throw new Error("Product not found");

    let rawPrice: number;
    let displayPrice: number;
    let commissionAmt: number;

    if (caller.role === "importer") {
      // Supplier is quoting their rawPrice — we calculate displayPrice for the buyer
      rawPrice = pricePerUnit;
      const { displayPrice: dp, commissionAmount: ca } = await applyCommission(
        ctx, rawPrice, product.category
      );
      displayPrice = dp;
      commissionAmt = ca;
    } else {
      // Buyer is counter-offering the displayPrice they see — reverse-calculate rawPrice
      displayPrice = pricePerUnit;
      const { displayPrice: dp, commissionAmount: ca } = await applyCommission(
        ctx, pricePerUnit, product.category
      );
      // Reverse: rawPrice = displayPrice / (1 + rate)
      commissionAmt = ca;
      rawPrice = displayPrice - commissionAmt;
    }

    const messageType = caller.role === "importer" ? "offer" : "counter_offer";

    await ctx.db.insert("messages", {
      dealId,
      senderId:  caller._id,
      content:   `${caller.alias} made an offer.`,
      type:      messageType,
      offerData: {
        quantity,
        pricePerUnit: displayPrice, // buyer always sees displayPrice
        note,
      },
      readBy:    [caller._id],
      createdAt: Date.now(),
    });

    // Update deal with latest offer figures
    await ctx.db.patch(dealId, {
      quantity,
      agreedRawPrice:     rawPrice,
      agreedDisplayPrice: displayPrice,
      commissionAmount:   commissionAmt,
      supplierPayout:     rawPrice,
      updatedAt:          Date.now(),
    });

    // Notify counterpart
    const recipientId = caller._id === deal.supplierId ? deal.buyerId : deal.supplierId;
    await ctx.db.insert("notifications", {
      userId:    recipientId,
      type:      "new_offer",
      title:     "New offer on your deal",
      body:      `${caller.alias} has made an offer for ${quantity} units.`,
      linkTo:    `/chat/${dealId}`,
      read:      false,
      createdAt: Date.now(),
    });
  },
});

/** Accept current deal terms and move to "agreed" */
export const acceptDeal = mutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, { dealId }) => {
    const caller = await getCallerUser(ctx);
    const deal = await ctx.db.get(dealId);
    if (!deal) throw new Error("Deal not found");

    const isParty = deal.supplierId === caller._id || deal.buyerId === caller._id;
    if (!isParty) throw new Error("Not party to this deal");
    if (deal.status !== "negotiating") throw new Error("Deal is not in negotiation");

    await ctx.db.patch(dealId, { status: "agreed", updatedAt: Date.now() });

    await ctx.db.insert("messages", {
      dealId,
      senderId:  caller._id,
      content:   `${caller.alias} accepted the deal terms. Waiting for payment.`,
      type:      "system",
      readBy:    [caller._id],
      createdAt: Date.now(),
    });
  },
});

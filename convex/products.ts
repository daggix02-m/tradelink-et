import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCallerUser, assertRole, applyCommission } from "./lib";

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Public product listing for the marketplace.
 * - Wholesalers see the display price (commission already added)
 * - Importers see their own rawPrice for their own products
 * - rawPrice is NEVER returned to wholesaler clients
 */
export const listProducts = query({
  args: {
    category: v.optional(v.string()),
    search:   v.optional(v.string()),
    limit:    v.optional(v.number()),
  },
  handler: async (ctx, { category, search, limit }) => {
    const caller = await getCallerUser(ctx);

    let productsQuery = ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    let products = await productsQuery.collect();

    if (category) {
      products = products.filter((p) => p.category === category);
    }

    if (search) {
      const lower = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          p.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    if (limit) products = products.slice(0, limit);

    // Apply commission and sanitize per role
    return Promise.all(
      products.map(async (product) => {
        const { displayPrice, commissionAmount } = await applyCommission(
          ctx,
          product.rawPrice,
          product.category
        );

        // Get supplier alias (never real name for wholesalers)
        const supplier = await ctx.db.get(product.supplierId);
        const supplierAlias = supplier?.alias ?? "Unknown Supplier";

        if (caller.role === "wholesaler") {
          // Strip rawPrice, show displayPrice as "price"
          const { rawPrice: _hidden, ...safeProduct } = product;
          return {
            ...safeProduct,
            price: displayPrice,
            supplierAlias,
            // Never reveal supplier identity to wholesaler
          };
        }

        if (caller.role === "importer") {
          // Importer sees their own listings with rawPrice
          return {
            ...product,
            price: product.rawPrice,
            displayPrice,
            commissionAmount,
            supplierAlias,
          };
        }

        // Admin sees everything
        return {
          ...product,
          displayPrice,
          commissionAmount,
          supplierAlias,
          supplierRealName: supplier?.displayName,
        };
      })
    );
  },
});

/** Get a single product by ID (commission-aware) */
export const getProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const caller = await getCallerUser(ctx);
    const product = await ctx.db.get(productId);
    if (!product || !product.isActive) return null;

    const { displayPrice, commissionAmount } = await applyCommission(
      ctx,
      product.rawPrice,
      product.category
    );

    const supplier = await ctx.db.get(product.supplierId);

    if (caller.role === "wholesaler") {
      const { rawPrice: _hidden, ...safeProduct } = product;
      return {
        ...safeProduct,
        price: displayPrice,
        supplierAlias: supplier?.alias,
      };
    }

    return {
      ...product,
      displayPrice,
      commissionAmount,
      supplierAlias: supplier?.alias,
      supplierRealName: caller.role === "admin" ? supplier?.displayName : undefined,
    };
  },
});

/** Get all listings for the current importer */
export const myListings = query({
  args: {},
  handler: async (ctx) => {
    const caller = await assertRole(ctx, ["importer", "admin"]);
    const supplierId = caller.role === "importer" ? caller._id : undefined;

    const products = await ctx.db
      .query("products")
      .withIndex("by_supplier", (q) =>
        supplierId ? q.eq("supplierId", supplierId) : q
      )
      .collect();

    return Promise.all(
      products.map(async (product) => {
        const { displayPrice, commissionAmount } = await applyCommission(
          ctx,
          product.rawPrice,
          product.category
        );
        return { ...product, displayPrice, commissionAmount };
      })
    );
  },
});

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Create a new product listing (importer only) */
export const createProduct = mutation({
  args: {
    title:       v.string(),
    description: v.string(),
    category:    v.string(),
    subcategory: v.optional(v.string()),
    rawPrice:    v.number(),
    unit:        v.string(),
    minOrderQty: v.number(),
    stock:       v.number(),
    images:      v.array(v.string()),
    tags:        v.array(v.string()),
    origin:      v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await assertRole(ctx, ["importer"]);

    return await ctx.db.insert("products", {
      ...args,
      supplierId: caller._id,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/** Update a product (importer can only update their own) */
export const updateProduct = mutation({
  args: {
    productId:   v.id("products"),
    title:       v.optional(v.string()),
    description: v.optional(v.string()),
    rawPrice:    v.optional(v.number()),
    stock:       v.optional(v.number()),
    isActive:    v.optional(v.boolean()),
  },
  handler: async (ctx, { productId, ...updates }) => {
    const caller = await assertRole(ctx, ["importer", "admin"]);
    const product = await ctx.db.get(productId);

    if (!product) throw new Error("Product not found");
    if (caller.role === "importer" && product.supplierId !== caller._id) {
      throw new Error("You can only update your own listings");
    }

    await ctx.db.patch(productId, { ...updates, updatedAt: Date.now() });
  },
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─────────────────────────────────────────────────────────────────────────
  // USERS
  // Importers/manufacturers and wholesalers both live here.
  // role = "importer" | "wholesaler" | "admin"
  // alias = the public-facing name shown in the marketplace (never real name)
  // ─────────────────────────────────────────────────────────────────────────
  users: defineTable({
    clerkId:       v.string(),
    email:         v.string(),
    role:          v.union(v.literal("importer"), v.literal("wholesaler"), v.literal("admin")),
    alias:         v.string(),          // shown publicly — e.g. "Supplier #1042"
    displayName:   v.string(),          // real business name (never shown to opposite party)
    phone:         v.optional(v.string()),
    city:          v.optional(v.string()),
    verified:      v.boolean(),
    avatarUrl:     v.optional(v.string()),
    createdAt:     v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCTS
  // rawPrice = what the importer/manufacturer actually receives
  // The broker middleware adds a commission on top before showing
  // any price to wholesalers — rawPrice is NEVER sent to the frontend
  // for non-admin users.
  // ─────────────────────────────────────────────────────────────────────────
  products: defineTable({
    supplierId:    v.id("users"),       // importer or manufacturer
    title:         v.string(),
    description:   v.string(),
    category:      v.string(),
    subcategory:   v.optional(v.string()),
    rawPrice:      v.number(),          // PRIVATE — supplier's actual price (ETB)
    unit:          v.string(),          // e.g. "kg", "box", "piece", "pallet"
    minOrderQty:   v.number(),
    stock:         v.number(),          // available units
    images:        v.array(v.string()), // Convex storage file IDs
    tags:          v.array(v.string()),
    isActive:      v.boolean(),
    origin:        v.optional(v.string()),
    createdAt:     v.number(),
    updatedAt:     v.number(),
  })
    .index("by_supplier", ["supplierId"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // ─────────────────────────────────────────────────────────────────────────
  // COMMISSION RULES
  // Admin configures commission rates per category or globally.
  // Applied silently inside Convex mutations — never exposed via queries
  // to importer or wholesaler roles.
  // ─────────────────────────────────────────────────────────────────────────
  commissionRules: defineTable({
    category:       v.optional(v.string()), // null = default/global rule
    ratePercent:    v.number(),             // e.g. 8 = 8%
    flatFeeEtb:     v.optional(v.number()), // optional flat fee on top
    isDefault:      v.boolean(),
    updatedBy:      v.id("users"),
    updatedAt:      v.number(),
  })
    .index("by_category", ["category"]),

  // ─────────────────────────────────────────────────────────────────────────
  // DEALS (negotiation threads)
  // Each deal is a negotiation between a supplier and a buyer, brokered
  // by the platform. Neither party sees the other's real identity until
  // the admin unlocks it (after payment clears).
  // ─────────────────────────────────────────────────────────────────────────
  deals: defineTable({
    productId:     v.id("products"),
    supplierId:    v.id("users"),       // importer/manufacturer
    buyerId:       v.id("users"),       // wholesaler
    status:        v.union(
      v.literal("negotiating"),
      v.literal("agreed"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("disputed")
    ),
    quantity:      v.number(),
    agreedRawPrice:      v.optional(v.number()),   // supplier's final price (private)
    agreedDisplayPrice:  v.optional(v.number()),   // price shown to buyer (includes commission)
    commissionAmount:    v.optional(v.number()),   // calculated commission (admin only)
    supplierPayout:      v.optional(v.number()),   // what supplier actually receives
    notes:         v.optional(v.string()),
    createdAt:     v.number(),
    updatedAt:     v.number(),
  })
    .index("by_supplier", ["supplierId"])
    .index("by_buyer", ["buyerId"])
    .index("by_product", ["productId"])
    .index("by_status", ["status"]),

  // ─────────────────────────────────────────────────────────────────────────
  // ORDERS
  // Created when a deal moves to "paid" status.
  // Buyer sees: totalPaid, status, shipping info
  // Supplier sees: supplierPayout, status, shipping info
  // Admin sees: everything including commissionEarned
  // ─────────────────────────────────────────────────────────────────────────
  orders: defineTable({
    dealId:            v.id("deals"),
    supplierId:        v.id("users"),
    buyerId:           v.id("users"),
    status:            v.union(
      v.literal("pending_payment"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    quantity:          v.number(),
    unitPrice:         v.number(),         // buyer's price per unit (raw + commission)
    totalPaid:         v.number(),         // total buyer pays
    supplierPayout:    v.number(),         // what supplier earns (PRIVATE from buyer)
    commissionEarned:  v.number(),         // platform revenue (admin only)
    paymentRef:        v.optional(v.string()),
    paymentGateway:    v.optional(v.string()),
    shippingAddress:   v.optional(v.string()),
    trackingNumber:    v.optional(v.string()),
    deliveredAt:       v.optional(v.number()),
    createdAt:         v.number(),
    updatedAt:         v.number(),
  })
    .index("by_supplier", ["supplierId"])
    .index("by_buyer", ["buyerId"])
    .index("by_deal", ["dealId"])
    .index("by_status", ["status"]),

  // ─────────────────────────────────────────────────────────────────────────
  // MESSAGES
  // Real-time chat within a deal thread.
  // senderId is stored but the frontend query returns the sender's alias
  // (not real name) to the opposing party — enforced server-side.
  // ─────────────────────────────────────────────────────────────────────────
  messages: defineTable({
    dealId:        v.id("deals"),
    senderId:      v.id("users"),
    content:       v.string(),
    type:          v.union(
      v.literal("text"),
      v.literal("offer"),          // structured price offer
      v.literal("counter_offer"),
      v.literal("system")          // automated deal status updates
    ),
    offerData:     v.optional(v.object({
      quantity:    v.number(),
      pricePerUnit: v.number(),    // displayed price (commission already added server-side)
      note:        v.optional(v.string()),
    })),
    readBy:        v.array(v.id("users")),
    createdAt:     v.number(),
  })
    .index("by_deal", ["dealId"])
    .index("by_sender", ["senderId"]),

  // ─────────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────
  notifications: defineTable({
    userId:        v.id("users"),
    type:          v.string(),          // "new_message" | "deal_update" | "order_shipped" etc.
    title:         v.string(),
    body:          v.string(),
    linkTo:        v.optional(v.string()),
    read:          v.boolean(),
    createdAt:     v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),

  // ─────────────────────────────────────────────────────────────────────────
  // REVIEWS
  // Suppliers and buyers can review each other after a delivered order.
  // Reviewer identity shown as alias only.
  // ─────────────────────────────────────────────────────────────────────────
  reviews: defineTable({
    orderId:       v.id("orders"),
    reviewerId:    v.id("users"),
    revieweeId:    v.id("users"),
    rating:        v.number(),           // 1–5
    comment:       v.optional(v.string()),
    createdAt:     v.number(),
  })
    .index("by_reviewee", ["revieweeId"])
    .index("by_order", ["orderId"]),
});

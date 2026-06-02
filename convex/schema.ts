import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email:         v.string(),
    role:          v.union(v.literal("importer"), v.literal("wholesaler"), v.literal("admin")),
    alias:         v.string(),
    displayName:   v.string(),
    phone:         v.optional(v.string()),
    city:          v.optional(v.string()),
    verified:      v.boolean(),
    avatarUrl:     v.optional(v.string()),
    createdAt:     v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  products: defineTable({
    supplierId:    v.id("users"),
    title:         v.string(),
    description:   v.string(),
    category:      v.string(),
    subcategory:   v.optional(v.string()),
    rawPrice:      v.number(),
    unit:          v.string(),
    minOrderQty:   v.number(),
    stock:         v.number(),
    images:        v.array(v.string()),
    tags:          v.array(v.string()),
    isActive:      v.boolean(),
    origin:        v.optional(v.string()),
    createdAt:     v.number(),
    updatedAt:     v.number(),
  })
    .index("by_supplier", ["supplierId"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  commissionRules: defineTable({
    category:       v.optional(v.string()),
    ratePercent:    v.number(),
    flatFeeEtb:     v.optional(v.number()),
    isDefault:      v.boolean(),
    updatedBy:      v.id("users"),
    updatedAt:      v.number(),
  })
    .index("by_category", ["category"]),

  deals: defineTable({
    productId:     v.id("products"),
    supplierId:    v.id("users"),
    buyerId:       v.id("users"),
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
    agreedRawPrice:      v.optional(v.number()),
    agreedDisplayPrice:  v.optional(v.number()),
    commissionAmount:    v.optional(v.number()),
    supplierPayout:      v.optional(v.number()),
    notes:         v.optional(v.string()),
    createdAt:     v.number(),
    updatedAt:     v.number(),
  })
    .index("by_supplier", ["supplierId"])
    .index("by_buyer", ["buyerId"])
    .index("by_product", ["productId"])
    .index("by_status", ["status"]),

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
    unitPrice:         v.number(),
    totalPaid:         v.number(),
    supplierPayout:    v.number(),
    commissionEarned:  v.number(),
    paymentRef:        v.optional(v.string()),
    paymentGateway:    v.optional(v.string()),
    shippingAddress:   v.optional(v.string()),
    trackingNumber:   v.optional(v.string()),
    deliveredAt:      v.optional(v.number()),
    createdAt:         v.number(),
    updatedAt:         v.number(),
  })
    .index("by_supplier", ["supplierId"])
    .index("by_buyer", ["buyerId"])
    .index("by_deal", ["dealId"])
    .index("by_status", ["status"]),

  messages: defineTable({
    dealId:        v.id("deals"),
    senderId:      v.id("users"),
    content:       v.string(),
    type:          v.union(
      v.literal("text"),
      v.literal("offer"),
      v.literal("counter_offer"),
      v.literal("system")
    ),
    offerData:     v.optional(v.object({
      quantity:    v.number(),
      pricePerUnit: v.number(),
      note:        v.optional(v.string()),
    })),
    readBy:        v.array(v.id("users")),
    createdAt:     v.number(),
  })
    .index("by_deal", ["dealId"])
    .index("by_sender", ["senderId"]),

  notifications: defineTable({
    userId:        v.id("users"),
    type:          v.string(),
    title:         v.string(),
    body:          v.string(),
    linkTo:        v.optional(v.string()),
    read:          v.boolean(),
    createdAt:     v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),

  reviews: defineTable({
    orderId:       v.id("orders"),
    reviewerId:    v.id("users"),
    revieweeId:    v.id("users"),
    rating:        v.number(),
    comment:       v.optional(v.string()),
    createdAt:     v.number(),
  })
    .index("by_reviewee", ["revieweeId"])
    .index("by_order", ["orderId"]),
});
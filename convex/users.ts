import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCallerUser, generateAlias } from "./lib";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const email = identity.email ?? "";
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const completeOnboarding = mutation({
  args: {
    role:        v.union(v.literal("importer"), v.literal("wholesaler")),
    displayName: v.string(),
    phone:       v.optional(v.string()),
    city:        v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = identity.email ?? "";

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) throw new Error("Profile already exists");

    const userId = await ctx.db.insert("users", {
      email,
      role:        args.role,
      displayName: args.displayName,
      alias:       "",
      phone:       args.phone,
      city:        args.city,
      verified:    false,
      createdAt:   Date.now(),
    });

    const alias = generateAlias(args.role, userId);
    await ctx.db.patch(userId, { alias });

    return userId;
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    phone:       v.optional(v.string()),
    city:        v.optional(v.string()),
    avatarUrl:   v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getCallerUser(ctx);
    await ctx.db.patch(caller._id, args);
  },
});

export const listAllUsers = query({
  args: { role: v.optional(v.string()) },
  handler: async (ctx, { role }) => {
    const caller = await getCallerUser(ctx);
    if (caller.role !== "admin") throw new Error("Admin access required");

    const users = role
      ? await ctx.db
          .query("users")
          .withIndex("by_role", (q) => q.eq("role", role as "importer" | "wholesaler" | "admin"))
          .collect()
      : await ctx.db.query("users").collect();

    return users;
  },
});

export const myNotifications = query({
  args: {},
  handler: async (ctx) => {
    const caller = await getCallerUser(ctx);
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", caller._id))
      .order("desc")
      .take(50);
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const caller = await getCallerUser(ctx);
    const notif = await ctx.db.get(notificationId);
    if (notif?.userId !== caller._id) throw new Error("Access denied");
    await ctx.db.patch(notificationId, { read: true });
  },
});
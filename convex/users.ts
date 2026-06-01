import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCallerUser, generateAlias } from "./lib";

/** Get the current user's profile */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

/** Complete onboarding — called once after sign-up */
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

    // Ensure user doesn't already exist
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) throw new Error("Profile already exists");

    const userId = await ctx.db.insert("users", {
      clerkId:     identity.subject,
      email:       identity.email ?? "",
      role:        args.role,
      displayName: args.displayName,
      alias:       "", // will be set below with the real ID
      phone:       args.phone,
      city:        args.city,
      verified:    false,
      createdAt:   Date.now(),
    });

    // Now update alias using the generated ID
    const alias = generateAlias(args.role, userId);
    await ctx.db.patch(userId, { alias });

    return userId;
  },
});

/** Update profile (non-sensitive fields only) */
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

/** Admin: list all users with full data */
export const listAllUsers = query({
  args: { role: v.optional(v.string()) },
  handler: async (ctx, { role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || caller.role !== "admin") throw new Error("Admin access required");

    const users = role
      ? await ctx.db
          .query("users")
          .withIndex("by_role", (q) => q.eq("role", role as "importer" | "wholesaler" | "admin"))
          .collect()
      : await ctx.db.query("users").collect();

    return users;
  },
});

/** Get notification list for current user */
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

/** Mark notification as read */
export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const caller = await getCallerUser(ctx);
    const notif = await ctx.db.get(notificationId);
    if (notif?.userId !== caller._id) throw new Error("Access denied");
    await ctx.db.patch(notificationId, { read: true });
  },
});

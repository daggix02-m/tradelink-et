import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCallerUser } from "./lib";

/** Real-time message stream for a deal thread */
export const listMessages = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, { dealId }) => {
    const caller = await getCallerUser(ctx);
    const deal = await ctx.db.get(dealId);
    if (!deal) return [];

    const isParty = deal.supplierId === caller._id || deal.buyerId === caller._id;
    if (!isParty && caller.role !== "admin") throw new Error("Access denied");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_deal", (q) => q.eq("dealId", dealId))
      .order("asc")
      .collect();

    // Resolve sender alias (never real identity to opposing party)
    return Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        const isOwnMessage = msg.senderId === caller._id;

        return {
          ...msg,
          senderAlias:  isOwnMessage ? "You" : (sender?.alias ?? "Unknown"),
          isOwn:        isOwnMessage,
          // Strip sender identity from opposing party
          senderId:     caller.role === "admin" ? msg.senderId : undefined,
          senderName:   caller.role === "admin" ? sender?.displayName : undefined,
        };
      })
    );
  },
});

/** Send a plain text message in a deal thread */
export const sendMessage = mutation({
  args: {
    dealId:  v.id("deals"),
    content: v.string(),
  },
  handler: async (ctx, { dealId, content }) => {
    const caller = await getCallerUser(ctx);
    const deal = await ctx.db.get(dealId);
    if (!deal) throw new Error("Deal not found");

    const isParty = deal.supplierId === caller._id || deal.buyerId === caller._id;
    if (!isParty) throw new Error("Not party to this deal");
    if (deal.status === "cancelled" || deal.status === "delivered") {
      throw new Error("Cannot message on a closed deal");
    }

    await ctx.db.insert("messages", {
      dealId,
      senderId:  caller._id,
      content:
        content.length > 2000 ? content.slice(0, 2000) : content,
      type:      "text",
      readBy:    [caller._id],
      createdAt: Date.now(),
    });

    // Mark unread for the other party
    const recipientId = caller._id === deal.supplierId ? deal.buyerId : deal.supplierId;
    await ctx.db.insert("notifications", {
      userId:    recipientId,
      type:      "new_message",
      title:     "New message",
      body:      `${caller.alias}: ${content.slice(0, 60)}${content.length > 60 ? "…" : ""}`,
      linkTo:    `/chat/${dealId}`,
      read:      false,
      createdAt: Date.now(),
    });
  },
});

/** Mark all messages in a deal as read by the caller */
export const markRead = mutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, { dealId }) => {
    const caller = await getCallerUser(ctx);

    const unread = await ctx.db
      .query("messages")
      .withIndex("by_deal", (q) => q.eq("dealId", dealId))
      .filter((q) => q.neq(q.field("readBy"), []))
      .collect();

    await Promise.all(
      unread
        .filter((m) => !m.readBy.includes(caller._id))
        .map((m) =>
          ctx.db.patch(m._id, { readBy: [...m.readBy, caller._id] })
        )
    );
  },
});

/** Unread message count for notification badge */
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const caller = await getCallerUser(ctx);

    const deals = await ctx.db
      .query("deals")
      .filter((q) =>
        q.or(
          q.eq(q.field("supplierId"), caller._id),
          q.eq(q.field("buyerId"), caller._id)
        )
      )
      .collect();

    let count = 0;
    for (const deal of deals) {
      const msgs = await ctx.db
        .query("messages")
        .withIndex("by_deal", (q) => q.eq("dealId", deal._id))
        .filter((q) => q.neq(q.field("senderId"), caller._id))
        .collect();
      count += msgs.filter((m) => !m.readBy.includes(caller._id)).length;
    }
    return count;
  },
});

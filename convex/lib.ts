import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ─── Auth helpers ────────────────────────────────────────────────────────────

/** Get the current authenticated user record, or throw if not signed in */
export async function getCallerUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) throw new Error("User profile not found. Please complete onboarding.");
  return user;
}

/** Assert the caller has one of the allowed roles */
export async function assertRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: Array<"importer" | "wholesaler" | "admin">
) {
  const user = await getCallerUser(ctx);
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${allowedRoles.join(" or ")}`);
  }
  return user;
}

// ─── Commission engine ───────────────────────────────────────────────────────

/**
 * Calculate the displayed price a wholesaler sees.
 * rawPrice is the supplier's actual price; the commission is injected here
 * and is NEVER returned to non-admin clients.
 *
 * Returns: { displayPrice, commissionAmount, supplierPayout }
 */
export async function applyCommission(
  ctx: QueryCtx | MutationCtx,
  rawPrice: number,
  category: string
): Promise<{
  displayPrice: number;
  commissionAmount: number;
  supplierPayout: number;
}> {
  // Find a category-specific rule first, fall back to default
  const categoryRule = await ctx.db
    .query("commissionRules")
    .withIndex("by_category", (q) => q.eq("category", category))
    .unique();

  const defaultRule = await ctx.db
    .query("commissionRules")
    .filter((q) => q.eq(q.field("isDefault"), true))
    .first();

  const rule = categoryRule ?? defaultRule;

  // If no rule configured yet, use a sensible default of 8%
  const ratePercent = rule?.ratePercent ?? 8;
  const flatFee = rule?.flatFeeEtb ?? 0;

  const commissionAmount = rawPrice * (ratePercent / 100) + flatFee;
  const displayPrice = rawPrice + commissionAmount;
  const supplierPayout = rawPrice; // supplier always gets rawPrice

  return {
    displayPrice: Math.round(displayPrice * 100) / 100,
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    supplierPayout,
  };
}

// ─── Product sanitization ────────────────────────────────────────────────────

/**
 * Strip rawPrice from a product doc before sending to non-admin users.
 * Replaces rawPrice with the commission-adjusted displayPrice.
 */
export function sanitizeProductForRole(
  product: { rawPrice: number; [key: string]: unknown },
  role: "importer" | "wholesaler" | "admin",
  displayPrice: number
) {
  if (role === "admin") return product; // admin sees everything

  if (role === "importer") {
    // Importer sees their own rawPrice, not the buyer-facing markup
    return product;
  }

  // Wholesaler — replace rawPrice with the marked-up displayPrice
  const { rawPrice: _hidden, ...rest } = product;
  return { ...rest, price: displayPrice };
}

// ─── Alias generator ─────────────────────────────────────────────────────────

/** Generate a human-readable alias for a user (shown to opposite party) */
export function generateAlias(role: "importer" | "wholesaler", id: string): string {
  const short = id.slice(-4).toUpperCase();
  return role === "importer" ? `Supplier-${short}` : `Buyer-${short}`;
}

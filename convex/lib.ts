import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getCallerUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  let email = identity?.email ?? "";

  if (!email) {
    const session = await ctx.db.query("mockSession").first();
    if (session) {
      email = session.email;
    }
  }

  if (!email) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();

  if (!user) throw new Error("User profile not found. Please complete onboarding.");
  return user;
}

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

export async function applyCommission(
  ctx: QueryCtx | MutationCtx,
  rawPrice: number,
  category: string
): Promise<{
  displayPrice: number;
  commissionAmount: number;
  supplierPayout: number;
}> {
  const categoryRule = await ctx.db
    .query("commissionRules")
    .withIndex("by_category", (q) => q.eq("category", category))
    .unique();

  const defaultRule = await ctx.db
    .query("commissionRules")
    .filter((q) => q.eq(q.field("isDefault"), true))
    .first();

  const rule = categoryRule ?? defaultRule;

  const ratePercent = rule?.ratePercent ?? 8;
  const flatFee = rule?.flatFeeEtb ?? 0;

  const commissionAmount = rawPrice * (ratePercent / 100) + flatFee;
  const displayPrice = rawPrice + commissionAmount;
  const supplierPayout = rawPrice;

  return {
    displayPrice: Math.round(displayPrice * 100) / 100,
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    supplierPayout,
  };
}

export function sanitizeProductForRole(
  product: { rawPrice: number; [key: string]: unknown },
  role: "importer" | "wholesaler" | "admin",
  displayPrice: number
) {
  if (role === "admin") return product;

  if (role === "importer") {
    return product;
  }

  const { rawPrice: _hidden, ...rest } = product;
  return { ...rest, price: displayPrice };
}

export function generateAlias(role: "importer" | "wholesaler", id: string): string {
  const short = id.slice(-4).toUpperCase();
  return role === "importer" ? `Supplier-${short}` : `Buyer-${short}`;
}
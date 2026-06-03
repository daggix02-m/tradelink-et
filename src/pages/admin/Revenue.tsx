import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { useEffect, useRef } from "react";
import { countUp } from "@/animations/gsap";
import { DollarSign, TrendingUp, ShoppingBag, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminRevenue() {
  const summary = useQuery(api.admin.revenueSummary, {});
  const rules = useQuery(api.admin.listCommissionRules, {});
  const ref = useGsapReveal({ delay: 0.05 });

  const gmvRef = useRef<HTMLSpanElement>(null);
  const commRef = useRef<HTMLSpanElement>(null);
  const payoutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!summary) return;
    if (gmvRef.current)
      countUp(gmvRef.current, summary.totalGMV, { prefix: "ETB ", duration: 1.5 });
    if (commRef.current)
      countUp(commRef.current, summary.totalCommission, { prefix: "ETB ", duration: 1.5 });
    if (payoutRef.current)
      countUp(payoutRef.current, summary.totalPaidOut, { prefix: "ETB ", duration: 1.5 });
  }, [summary]);

  const stats = [
    {
      label: "Total GMV",
      ref: gmvRef,
      icon: ShoppingBag,
      bg: "bg-primary/10",
      color: "text-primary",
    },
    {
      label: "Commission Earned",
      ref: commRef,
      icon: DollarSign,
      bg: "bg-secondary",
      color: "text-secondary-foreground",
    },
    {
      label: "Supplier Payouts",
      ref: payoutRef,
      icon: TrendingUp,
      bg: "bg-card",
      color: "text-foreground",
    },
  ];

  return (
    <div ref={ref} className="max-w-4xl space-y-6">
      <div className="gsap-reveal">
        <h1 className="text-2xl font-display font-semibold text-foreground">
          Revenue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full financial visibility — commission details are invisible to suppliers and buyers
        </p>
      </div>

      {/* KPI cards */}
      <div className="gsap-reveal grid grid-cols-3 gap-4">
        {stats.map(({ label, ref: statRef, icon: Icon, bg, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{label}</span>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <span ref={statRef} className="text-2xl font-display font-semibold text-foreground">
              ETB 0
            </span>
          </div>
        ))}
      </div>

      {/* Avg commission rate */}
      {summary && (
        <div className="gsap-reveal bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Percent size={22} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Effective commission rate</p>
            <p className="text-xl font-display font-semibold text-foreground">
              {summary.avgCommissionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              Across {summary.totalOrders} orders · {summary.deliveredOrders} delivered
            </p>
          </div>
        </div>
      )}

      {/* Commission rules */}
      <div className="gsap-reveal bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm">Commission rules</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Applied silently to all transactions
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-2.5 text-left text-xs text-muted-foreground font-medium">Category</th>
              <th className="px-4 py-2.5 text-left text-xs text-muted-foreground font-medium">Rate %</th>
              <th className="px-4 py-2.5 text-left text-xs text-muted-foreground font-medium">Flat fee (ETB)</th>
              <th className="px-4 py-2.5 text-left text-xs text-muted-foreground font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {rules?.map((r: any) => (
              <tr key={r._id} className="border-b border-muted hover:bg-muted">
                <td className="px-4 py-3 text-foreground">{r.category ?? "All categories"}</td>
                <td className="px-4 py-3 text-foreground">{r.ratePercent}%</td>
                <td className="px-4 py-3 text-muted-foreground">{r.flatFeeEtb ?? "—"}</td>
                <td className="px-4 py-3">
                  {r.isDefault ? (
                    <Badge variant="secondary">Default</Badge>
                  ) : (
                    <Badge variant="outline">Category</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
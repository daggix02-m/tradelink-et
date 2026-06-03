import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { useEffect, useRef } from "react";
import { countUp } from "@/animations/gsap";
import { Package, MessageSquare, ClipboardList, Plus, ArrowRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function ImporterDashboard() {
  const user = useQuery(api.users.me);
  const listings = useQuery(api.products.myListings, {});
  const deals = useQuery(api.deals.myDeals, {});
  const ref = useGsapReveal({ delay: 0.05 });

  // Animate stats
  const activeListingsRef = useRef<HTMLSpanElement>(null);
  const activeDealsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (activeListingsRef.current && listings) {
      countUp(activeListingsRef.current, listings.filter((l: any) => l.isActive).length, { duration: 1.2 });
    }
    if (activeDealsRef.current && deals) {
      countUp(activeDealsRef.current, deals.length, { duration: 1.2 });
    }
  }, [listings?.length, deals?.length]);

  const stats = [
    {
      label: "Active Listings",
      valueRef: activeListingsRef,
      value: listings?.filter((l: any) => l.isActive).length ?? 0,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Active Deals",
      valueRef: activeDealsRef,
      value: deals?.length ?? 0,
      icon: MessageSquare,
      color: "text-secondary-foreground",
      bg: "bg-secondary",
    },
  ];

  return (
    <div ref={ref} className="max-w-4xl space-y-6">
      {/* Greeting */}
      <div className="gsap-reveal">
        <h1 className="text-2xl font-display font-semibold text-foreground">
          Hello, {user?.displayName?.split(" ")[0] ?? "Supplier"} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your alias on the marketplace: <strong className="text-foreground">{user?.alias}</strong>
        </p>
      </div>

      {/* Stat cards */}
      <div className="gsap-reveal grid grid-cols-2 gap-4">
        {stats.map(({ label, valueRef, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
            </div>
            <span ref={valueRef} className="text-3xl font-display font-semibold text-foreground">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="gsap-reveal">
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <NavLink
            to="/importer/listings/new"
            className="bg-card border border-border rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Plus size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Add listing</p>
              <p className="text-xs text-muted-foreground">Post a new product</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-muted-foreground" />
          </NavLink>
          <NavLink
            to="/importer/orders"
            className="bg-card border border-border rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <ClipboardList size={18} className="text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">View orders</p>
              <p className="text-xs text-muted-foreground">Track your sales</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-muted-foreground" />
          </NavLink>
        </div>
      </div>

      {/* Recent deals */}
      <div className="gsap-reveal bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground text-sm">Recent deal activity</h2>
          <NavLink to="/chat" className="text-xs text-primary hover:text-primary flex items-center gap-1">
            View all <ArrowRight size={12} />
          </NavLink>
        </div>
        {deals?.slice(0, 5).map((deal: any) => (
          <div key={deal._id} className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-muted transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package size={14} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{deal.productTitle}</p>
              <p className="text-xs text-muted-foreground">{deal.counterpartAlias} · {deal.quantity} units</p>
            </div>
            <Badge variant={deal.status === "negotiating" ? "outline" : "secondary"}>{deal.status}</Badge>
          </div>
        ))}
        {!deals?.length && (
          <div className="py-10 text-center text-muted-foreground text-sm">
            No deals yet — <NavLink to="/importer/listings/new" className="text-primary">add your first listing</NavLink>
          </div>
        )}
      </div>
    </div>
  );
}
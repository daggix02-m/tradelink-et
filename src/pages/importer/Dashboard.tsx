import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { useEffect, useRef } from "react";
import { countUp } from "@/animations/gsap";
import { Package, TrendingUp, MessageSquare, ClipboardList, Plus, ArrowRight } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function ImporterDashboard() {
  const user = useQuery(api.users.me);
  const listings = useQuery(api.products.myListings, {});
  const deals = useQuery(api.deals.myDeals, {});
  const notifications = useQuery(api.users.myNotifications, {});
  const ref = useGsapReveal({ delay: 0.05 });

  // Animate stats
  const activeListingsRef = useRef<HTMLSpanElement>(null);
  const activeDealsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (activeListingsRef.current && listings) {
      countUp(activeListingsRef.current, listings.filter((l: any) => l.isActive).length, {
        duration: 1.2,
      });
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
      color: "text-brand-600",
      bg: "bg-brand-50",
    },
    {
      label: "Active Deals",
      valueRef: activeDealsRef,
      value: deals?.length ?? 0,
      icon: MessageSquare,
      color: "text-gold-600",
      bg: "bg-gold-50",
    },
  ];

  return (
    <div ref={ref} className="max-w-4xl space-y-6">
      {/* Greeting */}
      <div className="gsap-reveal">
        <h1 className="text-2xl font-display font-semibold text-neutral-900">
          Hello, {user?.displayName?.split(" ")[0] ?? "Supplier"} 👋
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Your alias on the marketplace: <strong className="text-neutral-700">{user?.alias}</strong>
        </p>
      </div>

      {/* Stat cards */}
      <div className="gsap-reveal grid grid-cols-2 gap-4">
        {stats.map(({ label, valueRef, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-500">{label}</span>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
            </div>
            <span
              ref={valueRef}
              className="text-3xl font-display font-semibold text-neutral-900"
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="gsap-reveal">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <NavLink to="/importer/listings/new" className="card-hover p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Plus size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Add listing</p>
              <p className="text-xs text-neutral-500">Post a new product</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-neutral-300" />
          </NavLink>
          <NavLink to="/importer/orders" className="card-hover p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-100 flex items-center justify-center">
              <ClipboardList size={18} className="text-gold-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">View orders</p>
              <p className="text-xs text-neutral-500">Track your sales</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-neutral-300" />
          </NavLink>
        </div>
      </div>

      {/* Recent deals */}
      <div className="gsap-reveal card overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 text-sm">Recent deal activity</h2>
          <NavLink to="/chat" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </NavLink>
        </div>
        {deals?.slice(0, 5).map((deal: any) => (
          <div key={deal._id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <Package size={14} className="text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-900 truncate">{deal.productTitle}</p>
              <p className="text-xs text-neutral-500">{deal.counterpartAlias} · {deal.quantity} units</p>
            </div>
            <span className={`badge ${deal.status === "negotiating" ? "badge-gold" : "badge-green"}`}>
              {deal.status}
            </span>
          </div>
        ))}
        {!deals?.length && (
          <div className="py-10 text-center text-neutral-400 text-sm">
            No deals yet — <NavLink to="/importer/listings/new" className="text-brand-600">add your first listing</NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

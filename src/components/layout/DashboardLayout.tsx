import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  TrendingUp, Users, Settings, LogOut, Bell, ChevronRight,
  Store, DollarSign, ClipboardList
} from "lucide-react";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const importerNav = [
  { to: "/importer",          icon: LayoutDashboard, label: "Dashboard",  end: true },
  { to: "/importer/listings", icon: Package,         label: "My Listings" },
  { to: "/importer/orders",   icon: ClipboardList,   label: "Orders" },
  { to: "/importer/earnings", icon: TrendingUp,      label: "Earnings" },
  { to: "/marketplace",       icon: Store,           label: "Marketplace" },
  { to: "/chat",              icon: MessageSquare,   label: "Messages" },
];

const wholesalerNav = [
  { to: "/wholesaler",          icon: LayoutDashboard, label: "Dashboard",  end: true },
  { to: "/marketplace",         icon: Store,           label: "Marketplace" },
  { to: "/wholesaler/orders",   icon: ClipboardList,   label: "My Orders" },
  { to: "/wholesaler/cart",     icon: ShoppingCart,    label: "Cart" },
  { to: "/chat",                icon: MessageSquare,   label: "Messages" },
];

const adminNav = [
  { to: "/admin",          icon: LayoutDashboard, label: "Dashboard",  end: true },
  { to: "/admin/deals",    icon: ClipboardList,   label: "All Deals" },
  { to: "/admin/revenue",  icon: DollarSign,      label: "Revenue" },
  { to: "/admin/users",    icon: Users,           label: "Users" },
  { to: "/marketplace",    icon: Store,           label: "Marketplace" },
];

export default function DashboardLayout() {
  const user = useQuery(api.users.me);
  const unread = useQuery(api.messages.unreadCount);
  const navigate = useNavigate();
  const sidebarRef = useGsapReveal({ delay: 0.1 });

  const navItems =
    user?.role === "admin"
      ? adminNav
      : user?.role === "importer"
      ? importerNav
      : wholesalerNav;

  const roleLabel =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "importer"
      ? "Supplier"
      : "Wholesaler";

  const roleVariant =
    user?.role === "admin"
      ? "destructive"
      : user?.role === "importer"
      ? "default"
      : "secondary";

  const handleSignOut = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        className="w-64 bg-card border-r border-border flex flex-col h-full"
      >
        {/* Logo */}
        <div className="gsap-reveal px-6 py-5 border-b border-border">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="font-semibold text-foreground">
              TradeLink<span className="text-primary"> ET</span>
            </span>
          </NavLink>
        </div>

        {/* User info */}
        <div className="gsap-reveal px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {user?.displayName?.[0] ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.displayName ?? "Loading…"}
              </p>
              <Badge variant={roleVariant} className="text-xs">{roleLabel}</Badge>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "gsap-reveal flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {label === "Messages" && (unread ?? 0) > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="gsap-reveal px-3 py-4 border-t border-border space-y-0.5">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-all"
          >
            <Settings size={17} />
            Settings
          </NavLink>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>TradeLink ET</span>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">{roleLabel} Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <NavLink
              to="/chat"
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell size={18} className="text-muted-foreground" />
              {(unread ?? 0) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </NavLink>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
              {user?.displayName?.[0] ?? "?"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
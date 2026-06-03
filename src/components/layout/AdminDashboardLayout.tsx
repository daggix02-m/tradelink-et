import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  Store,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMockAuth } from "@/hooks/useMockAuth";

const adminNav = [
  { to: "/admin",          icon: LayoutDashboard, label: "Dashboard",  end: true },
  { to: "/admin/deals",    icon: ClipboardList,   label: "All Deals" },
  { to: "/admin/revenue",  icon: DollarSign,      label: "Revenue" },
  { to: "/admin/users",    icon: Users,           label: "Users" },
  { to: "/marketplace",    icon: Store,           label: "Marketplace" },
];

export default function AdminDashboardLayout() {
  const convexUser = useQuery(api.users.me);
  const unread = useQuery(api.messages.unreadCount);
  const navigate = useNavigate();
  const sidebarRef = useGsapReveal({ delay: 0.1 });
  const { logout } = useMockAuth();
  const displayName = convexUser?.displayName ?? "Admin";
  const roleLabel = "Admin";
  const roleVariant: "destructive" = "destructive";

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside ref={sidebarRef} className="w-64 bg-card border-r border-border flex flex-col h-full">
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
              {displayName[0] ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <Badge variant={roleVariant} className="text-xs text-muted-foreground">{roleLabel}</Badge>
            </div>
          </div>
        </div>
        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {adminNav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "gsap-reveal flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-all">
            <Settings size={17} />
            Settings
          </NavLink>
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <LogOut size={17} />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>TradeLink ET</span>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">{roleLabel} Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NavLink to="/chat" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell size={18} className="text-muted-foreground" />
              {(unread ?? 0) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </NavLink>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
              {displayName[0] ?? "?"}
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

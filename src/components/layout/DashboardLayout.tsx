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
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import ImporterDashboardLayout from "@/components/layout/ImporterDashboardLayout";
import WholesalerDashboardLayout from "@/components/layout/WholesalerDashboardLayout";
import { useMockAuth } from "@/hooks/useMockAuth";

export default function DashboardLayout() {
  const convexUser = useQuery(api.users.me);
  const { role } = useMockAuth();
  const effectiveRole = convexUser?.role ?? role;

  if (effectiveRole === "admin") {
    return <AdminDashboardLayout />;
  } else if (effectiveRole === "importer") {
    return <ImporterDashboardLayout />;
  } else {
    return <WholesalerDashboardLayout />;
  }
}
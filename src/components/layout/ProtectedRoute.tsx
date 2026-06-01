import { Navigate, Outlet } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// ── ProtectedRoute ────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;

  return children ? <>{children}</> : <Outlet />;
}

// ── RoleRoute ─────────────────────────────────────────────────────────────────

interface RoleRouteProps {
  role: "importer" | "wholesaler" | "admin";
}

export function RoleRoute({ role }: RoleRouteProps) {
  const user = useQuery(api.users.me);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/onboarding" replace />;

  if (user.role !== role) {
    // Redirect to their correct dashboard
    const home =
      user.role === "importer"
        ? "/importer"
        : user.role === "wholesaler"
        ? "/wholesaler"
        : "/admin";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}

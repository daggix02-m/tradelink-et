import { Navigate, Outlet } from "react-router-dom";
import { useMockAuth } from "@/hooks/useMockAuth";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useMockAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;

  return children ? <>{children}</> : <Outlet />;
}

interface RoleRouteProps {
  role: "importer" | "wholesaler" | "admin";
}

export function RoleRoute({ role }: RoleRouteProps) {
  const currentRole = useMockAuth((s) => s.role);
  const isAuthenticated = useMockAuth((s) => s.isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/onboarding" replace />;

  if (currentRole !== role) {
    const home =
      currentRole === "importer"
        ? "/importer"
        : currentRole === "wholesaler"
        ? "/wholesaler"
        : "/admin";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { useMockAuth } from "@/hooks/useMockAuth";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "react-hot-toast";

export default function AdminAuthPage() {
  const containerRef = useGsapReveal<HTMLDivElement>();
  const navigate = useNavigate();
  const { login } = useMockAuth();
  const verifyAdmin = useMutation(api.users.verifyAdmin);
  const setMockSession = useMutation(api.users.setMockSession);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await verifyAdmin({ email, password });
      if (result.success) {
        await setMockSession({ email });
        toast.success("Welcome, System Admin");
        login("admin");
        navigate("/admin");
      } else {
        toast.error(result.message || "Invalid email or password");
      }
    } catch (err) {
      toast.error("Authentication failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background" ref={containerRef}>
      {/* Absolute theme toggle in corner */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 gsap-reveal">
        <div className="max-w-sm w-full mx-auto">
          <Link to="/portal-select" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Portal Selection
          </Link>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <ShieldAlert size={24} />
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-primary">
              Admin Portal
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              System Admin Sign In
            </h2>
            <p className="text-muted-foreground">
              Authorized personnel only. Please sign in to access system operations and statistics.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="admin@tradelink.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-4" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : "Sign In"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right side - Value Prop / Security Notice */}
      <div className="hidden md:flex flex-1 bg-neutral-900 p-12 text-white flex-col justify-between gsap-reveal">
        <div className="max-w-lg">
          <h2 className="text-4xl font-display font-bold mb-6">
            Platform Management & Supervision
          </h2>
          <ul className="space-y-4 text-neutral-300 text-lg">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white" />
              Monitor live trades and commissions
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white" />
              Manage user roles and verifications
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white" />
              Configure platform-wide transaction limits
            </li>
          </ul>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <p className="text-sm text-neutral-400">
            <strong>Security Notice:</strong> All actions on this portal are logged and monitored. Unauthorized access attempts will be blocked and recorded.
          </p>
        </div>
      </div>
    </div>
  );
}

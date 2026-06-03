import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import { useMockAuth } from "@/hooks/useMockAuth";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

interface AuthProps {
  mode: "login" | "register";
}

export default function ImporterAuthPage({ mode }: AuthProps) {
  const containerRef = useGsapReveal<HTMLDivElement>();
  const navigate = useNavigate();
  const { login } = useMockAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(mode === "login" ? "importer@test.com" : "");
  const setMockSession = useMutation(api.users.setMockSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await setMockSession({ email });
      login("importer");
      navigate("/importer");
    } catch (err) {
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
              <Building2 size={24} />
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-primary">
              Importer Portal
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login" 
                ? "Enter your credentials to access your listings and orders."
                : "Join the marketplace and start selling to verified wholesalers."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. Abyssinia Exports Ltd."
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••"
                defaultValue={mode === "login" ? "password" : ""}
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-4" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : mode === "login" ? "Sign In" : "Register Business"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don't have an importer account?{" "}
                <Link to="/importer/register" className="text-primary font-medium hover:underline">
                  Register here
                </Link>
              </>
            ) : (
              <>
                Already have an importer account?{" "}
                <Link to="/importer/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right side - Importer Value Prop */}
      <div className="hidden md:flex flex-1 bg-primary p-12 text-primary-foreground flex-col justify-between gsap-reveal">
        <div className="max-w-lg">
          <h2 className="text-4xl font-display font-bold mb-6">
            Reach thousands of local verified buyers.
          </h2>
          <ul className="space-y-4 text-primary-foreground/80 text-lg">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white" />
              Direct access to wholesale market
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white" />
              Secure Escrow payments integration
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white" />
              Transparent low-commission fee structure
            </li>
          </ul>
        </div>
        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
          <p className="italic text-lg mb-4">
            "TradeLink ET completely transformed our distribution network. We now sell our inventory faster without worrying about unpaid invoices."
          </p>
          <p className="font-semibold">— Samuel T., Addis Textiles</p>
        </div>
      </div>
    </div>
  );
}

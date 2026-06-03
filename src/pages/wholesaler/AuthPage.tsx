import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { useMockAuth } from "@/hooks/useMockAuth";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

interface AuthProps {
  mode: "login" | "register";
}

export default function WholesalerAuthPage({ mode }: AuthProps) {
  const containerRef = useGsapReveal<HTMLDivElement>();
  const navigate = useNavigate();
  const { login } = useMockAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(mode === "login" ? "wholesaler@test.com" : "");
  const setMockSession = useMutation(api.users.setMockSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await setMockSession({ email });
      login("wholesaler");
      navigate("/wholesaler");
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
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-secondary-foreground">
              <ShoppingCart size={24} />
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-neutral-900">
              Wholesaler Portal
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {mode === "login" ? "Welcome back" : "Start sourcing"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login" 
                ? "Enter your credentials to manage your sourcing and orders."
                : "Create your free account to access zero-markup deals."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 transition-all"
                  placeholder="e.g. Merkato Distributors"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 transition-all"
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
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 transition-all"
                placeholder="••••••••"
                defaultValue={mode === "login" ? "password" : ""}
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-4 bg-neutral-900 hover:bg-neutral-800" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : mode === "login" ? "Sign In" : "Register Business"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don't have a wholesaler account?{" "}
                <Link to="/wholesaler/register" className="text-neutral-900 font-medium hover:underline">
                  Register here
                </Link>
              </>
            ) : (
              <>
                Already have a wholesaler account?{" "}
                <Link to="/wholesaler/login" className="text-neutral-900 font-medium hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right side - Wholesaler Value Prop */}
      <div className="hidden md:flex flex-1 bg-neutral-900 p-12 text-white flex-col justify-between gsap-reveal">
        <div className="max-w-lg">
          <h2 className="text-4xl font-display font-bold mb-6">
            Source smarter, faster, and cheaper.
          </h2>
          <ul className="space-y-4 text-neutral-300 text-lg">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              Zero markups from the platform
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              Direct negotiation with top importers
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              Secure payments via local banks
            </li>
          </ul>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
          <p className="italic text-lg mb-4 text-neutral-200">
            "I used to travel constantly to find reliable suppliers. TradeLink ET gives me direct access from my office, saving me time and securing better prices."
          </p>
          <p className="font-semibold">— Dawit A., Wholesaler</p>
        </div>
      </div>
    </div>
  );
}

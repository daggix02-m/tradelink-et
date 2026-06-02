import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "@convex/_generated/api";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Package, ShoppingBag, ArrowRight, Check } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = "importer" | "wholesaler";

export default function OnboardingPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useGsapReveal();

  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!role || !displayName.trim()) return;
    setLoading(true);
    try {
      await completeOnboarding({ role, displayName: displayName.trim(), phone, city });
      toast.success("Welcome to TradeLink ET!");
      navigate(role === "importer" ? "/importer" : "/wholesaler");
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div ref={ref} className="w-full max-w-lg">
        {/* Header */}
        <div className="gsap-reveal text-center mb-10">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">T</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Welcome to TradeLink ET
          </h1>
          <p className="text-muted-foreground text-sm">
            Tell us how you'll use the platform to get started
          </p>
        </div>

        {/* Role selection */}
        <div className="gsap-reveal grid grid-cols-2 gap-4 mb-6">
          {[
            {
              value: "importer" as Role,
              icon: Package,
              title: "Importer / Manufacturer",
              desc: "I have products to sell to wholesalers",
              color: "border-primary/20 bg-primary/10",
              activeColor: "border-primary bg-primary/10 ring-2 ring-primary/30",
            },
            {
              value: "wholesaler" as Role,
              icon: ShoppingBag,
              title: "Wholesaler / Buyer",
              desc: "I want to buy products in bulk",
              color: "border-border bg-card",
              activeColor: "border-secondary bg-secondary ring-2 ring-secondary",
            },
          ].map(({ value, icon: Icon, title, desc, activeColor, color }) => (
            <button
              key={value}
              onClick={() => setRole(value)}
              className={cn(
                "relative p-5 rounded-2xl border-2 text-left transition-all",
                role === value ? activeColor : color + " hover:border-primary/30"
              )}
            >
              {role === value && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check size={11} className="text-primary-foreground" />
                </div>
              )}
              <Icon size={28} className="mb-3 text-foreground" />
              <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>

        {/* Profile fields */}
        <div className="gsap-reveal bg-card border border-border rounded-xl p-5 space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Business / Display Name *
            </label>
            <Input
              placeholder="e.g. Addis Trading Co."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Phone</label>
              <Input
                placeholder="+251 9xx xxx xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">City</label>
              <Input
                placeholder="Addis Ababa"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="gsap-reveal bg-secondary border border-secondary rounded-xl p-4 mb-6 text-xs text-secondary-foreground">
          🔒 Your business identity is protected. The platform assigns you an anonymous alias
          (e.g. "Supplier-A12B") — the other party never sees your real name until a deal is completed.
        </div>

        <div className="gsap-reveal">
          <Button
            onClick={handleSubmit}
            disabled={!role || !displayName.trim() || loading}
            className="w-full h-auto py-3 text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Get started <ArrowRight size={18} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
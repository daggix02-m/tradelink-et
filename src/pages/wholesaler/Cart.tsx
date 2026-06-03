import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function WholesalerCart() {
  const containerRef = useGsapReveal<HTMLDivElement>();

  return (
    <div className="p-6 max-w-7xl mx-auto" ref={containerRef}>
      <div className="mb-8 gsap-reveal">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">Review your intended purchases.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 text-center gsap-reveal shadow-sm">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Link to="/marketplace">
          <Button>Browse Marketplace</Button>
        </Link>
      </div>
    </div>
  );
}

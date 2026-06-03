import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function WholesalerOrders() {
  const containerRef = useGsapReveal<HTMLDivElement>();

  return (
    <div className="p-6 max-w-7xl mx-auto" ref={containerRef}>
      <div className="mb-8 gsap-reveal">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track your purchased products and delivery status.</p>
      </div>

      <div className="space-y-4 gsap-reveal">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">Paid</span>
                <span className="text-xs text-muted-foreground">Order #ORD-2891</span>
              </div>
              <h3 className="font-semibold text-lg">Teff Flour (White)</h3>
            </div>
            <div className="text-right">
              <p className="font-bold">12,000 ETB</p>
              <p className="text-sm text-muted-foreground">100 kg</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} />
              <span>Delivering to: Addis Ababa Warehouse</span>
            </div>
            <Button variant="outline" size="sm">Track Delivery</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

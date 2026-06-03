import { Link } from "react-router-dom";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { countUp } from "@/animations/gsap";
import { useEffect, useRef } from "react";
import { Package, Clock, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WholesalerDashboard() {
  const containerRef = useGsapReveal<HTMLDivElement>();
  
  const statsRefs = {
    activeDeals: useRef<HTMLParagraphElement>(null),
    completedOrders: useRef<HTMLParagraphElement>(null),
    totalSpent: useRef<HTMLParagraphElement>(null),
  };

  useEffect(() => {
    if (statsRefs.activeDeals.current) countUp(statsRefs.activeDeals.current, 3);
    if (statsRefs.completedOrders.current) countUp(statsRefs.completedOrders.current, 12);
    if (statsRefs.totalSpent.current) countUp(statsRefs.totalSpent.current, 1450000, { prefix: "ETB " });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto" ref={containerRef}>
      <div className="mb-8 gsap-reveal">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Buyer Dashboard</h1>
        <p className="text-muted-foreground">Manage your sourcing, active deals, and orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 gsap-reveal">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Clock size={24} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Active Deals</span>
          </div>
          <p className="text-3xl font-bold" ref={statsRefs.activeDeals}>0</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Completed</span>
          </div>
          <p className="text-3xl font-bold" ref={statsRefs.completedOrders}>0</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Sourced</span>
          </div>
          <p className="text-3xl font-bold" ref={statsRefs.totalSpent}>ETB 0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 gsap-reveal">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold">Recent Deals (Negotiating)</h2>
            <Link to="/wholesaler/orders" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {[
              { id: "d1", product: "Premium Ethiopian Coffee Beans", supplier: "Supplier-A9F2", status: "Action Required", price: "450 ETB/kg", qty: "200 kg" },
              { id: "d2", product: "Industrial Sewing Machines", supplier: "Supplier-C7L9", status: "Awaiting Reply", price: "24,500 ETB", qty: "10 units" },
            ].map(deal => (
              <div key={deal.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border border-border rounded-xl gap-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Package className="text-muted-foreground" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{deal.product}</h3>
                    <p className="text-sm text-muted-foreground">{deal.supplier} • {deal.qty}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <div className="flex items-center gap-2">
                    {deal.status === "Action Required" && <AlertCircle size={14} className="text-orange-500" />}
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${deal.status === "Action Required" ? "bg-orange-100 text-orange-700" : "bg-secondary text-secondary-foreground"}`}>
                      {deal.status}
                    </span>
                  </div>
                  <Link to="/chat">
                    <Button variant="outline" size="sm">Open Chat</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 gsap-reveal">
           <div className="border border-border bg-card rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10" />
             <h3 className="font-bold text-lg mb-2">Ready for Checkout</h3>
             <p className="text-muted-foreground text-sm mb-6">You have 1 deal agreed and waiting for payment.</p>
             
             <div className="bg-secondary p-4 rounded-xl mb-6 border border-border">
               <p className="font-semibold line-clamp-1 mb-1">Teff Flour (White)</p>
               <div className="flex justify-between text-sm mb-2">
                 <span className="text-muted-foreground">Supplier-B3X1</span>
                 <span>100 kg</span>
               </div>
               <div className="flex justify-between items-center pt-2 border-t border-border/50">
                 <span className="text-sm text-muted-foreground">Total</span>
                 <span className="font-bold">12,000 ETB</span>
               </div>
             </div>

             <Link to="/wholesaler/checkout">
               <Button className="w-full">Proceed to Payment</Button>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}

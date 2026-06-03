import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { ArrowLeft, ShieldCheck, MapPin } from "lucide-react";
import ChapaPaymentSimulator from "@/components/ChapaPaymentSimulator";
import { Button } from "@/components/ui/button";

export default function WholesalerCheckout() {
  const containerRef = useGsapReveal<HTMLDivElement>();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  // Mock deal data that has been "agreed" upon in chat
  const mockDeal = {
    id: "deal-109",
    productTitle: "Teff Flour (White)",
    supplierAlias: "Supplier-B3X1",
    quantity: 100,
    unit: "kg",
    pricePerUnit: 120, // Display price (commission included)
    totalPrice: 12000,
  };

  const handlePaymentSuccess = () => {
    navigate("/wholesaler/orders?success=true");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto" ref={containerRef}>
      <Link to="/wholesaler" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors gsap-reveal">
        <ArrowLeft size={16} className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="mb-8 gsap-reveal">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Secure Checkout</h1>
        <p className="text-muted-foreground">Review your agreed deal and proceed with payment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6 gsap-reveal">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Order Summary</h2>
            
            <div className="flex items-start justify-between py-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-lg">{mockDeal.productTitle}</h3>
                <p className="text-sm text-muted-foreground mt-1">Supplier: {mockDeal.supplierAlias}</p>
                <p className="text-sm text-muted-foreground">Quantity: {mockDeal.quantity} {mockDeal.unit}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{mockDeal.pricePerUnit.toLocaleString()} ETB / {mockDeal.unit}</p>
              </div>
            </div>

            <div className="py-4 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{mockDeal.totalPrice.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Commission</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-4 border-t border-border mt-2">
                <span>Total Amount</span>
                <span className="text-primary">{mockDeal.totalPrice.toLocaleString()} ETB</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
             <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2">
               <MapPin size={20} className="text-muted-foreground" />
               Delivery Information
             </h2>
             <div className="p-4 bg-secondary rounded-xl border border-border">
               <p className="font-medium">Addis Ababa Warehouse (Default)</p>
               <p className="text-sm text-muted-foreground mt-1">Bole Road, Block 4</p>
               <p className="text-sm text-muted-foreground">Addis Ababa, Ethiopia</p>
             </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="gsap-reveal">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden sticky top-6">
            {!showPayment ? (
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Escrow Protection</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your payment is securely held in our local bank escrow. The supplier is only paid after you confirm delivery.
                </p>
                <Button className="w-full h-12 text-base" onClick={() => setShowPayment(true)}>
                  Proceed to Payment
                </Button>
              </div>
            ) : (
              <ChapaPaymentSimulator 
                amount={mockDeal.totalPrice} 
                onSuccess={handlePaymentSuccess} 
                onCancel={() => setShowPayment(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

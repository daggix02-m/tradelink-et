import { Link } from "react-router-dom";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImporterListings() {
  const containerRef = useGsapReveal<HTMLDivElement>();

  return (
    <div className="p-6 max-w-7xl mx-auto" ref={containerRef}>
      <div className="flex justify-between items-center mb-8 gsap-reveal">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Listings</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link to="/importer/listings/new">
          <Button>
            <Plus className="mr-2" size={18} />
            Add New Product
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 text-center gsap-reveal shadow-sm">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">No listings yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You haven't added any products to the marketplace yet. Add your first product to start receiving wholesale offers.
        </p>
        <Link to="/importer/listings/new">
          <Button>Add First Product</Button>
        </Link>
      </div>
    </div>
  );
}

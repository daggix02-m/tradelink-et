import { useParams, Link } from "react-router-dom";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { useMockAuth } from "@/hooks/useMockAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, ShieldCheck, Truck, Clock } from "lucide-react";
import toast from "react-hot-toast";

const MOCK_PRODUCTS = {
  p1: {
    title: "Premium Ethiopian Coffee Beans (Yirgacheffe)",
    description: "Grade 1 washed coffee beans, ready for export or local roasting. Sourced directly from Yirgacheffe farmers. Hand-picked and sorted for the highest quality. Ideal for specialty coffee roasters looking for distinct floral and citrus notes.",
    category: "Agriculture",
    price: 450.00,
    unit: "kg",
    minOrderQty: 100,
    stock: 5000,
    images: ["https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=1000&q=80"],
    supplierAlias: "Supplier-A9F2",
    tags: ["Export Quality", "Washed", "Grade 1"],
    origin: "Yirgacheffe, Ethiopia"
  },
  p2: {
    title: "Teff Flour (White)",
    description: "High quality white teff flour milled locally. Perfect for making authentic injera. Naturally gluten-free and rich in iron.",
    category: "Agriculture",
    price: 120.00,
    unit: "kg",
    minOrderQty: 50,
    stock: 2000,
    images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&q=80"],
    supplierAlias: "Supplier-B3X1",
    tags: ["Gluten Free", "Organic"],
    origin: "Bishoftu, Ethiopia"
  },
  p3: {
    title: "Industrial Sewing Machines",
    description: "Heavy duty sewing machines for garment factories. Comes with a 1-year warranty and free installation within Addis Ababa.",
    category: "Machinery",
    price: 25000.00,
    unit: "unit",
    minOrderQty: 5,
    stock: 45,
    images: ["https://images.unsplash.com/photo-1621252179027-94459d278660?w=1000&q=80"],
    supplierAlias: "Supplier-C7L9",
    tags: ["Industrial", "Garment"],
    origin: "Imported"
  }
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const containerRef = useGsapReveal<HTMLDivElement>();
  const { role } = useMockAuth();
  
  const product = productId ? MOCK_PRODUCTS[productId as keyof typeof MOCK_PRODUCTS] : null;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/marketplace">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const handleStartDeal = () => {
    toast.success("Deal initiated! Redirecting to chat...");
    // In a real app, this would mutate `deals` and navigate to `/chat/:dealId`
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" ref={containerRef}>
      <Link to="/marketplace" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors gsap-reveal">
        <ArrowLeft size={16} className="mr-2" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4 gsap-reveal">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border border-border">
            <img 
              src={product.images[0]} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gsap-reveal">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-md font-medium">
                {product.category}
              </span>
              {product.tags.map(tag => (
                <span key={tag} className="bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-md font-medium border border-border">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              {product.title}
            </h1>
            <p className="text-2xl font-bold text-foreground">
              ETB {product.price.toLocaleString("en-ET", { minimumFractionDigits: 2 })} <span className="text-base font-normal text-muted-foreground">/ {product.unit}</span>
            </p>
          </div>

          <div className="space-y-6 mb-8 flex-1">
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-card border border-border rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Minimum Order</p>
                <p className="font-semibold">{product.minOrderQty} {product.unit}s</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Available Stock</p>
                <p className="font-semibold">{product.stock.toLocaleString()} {product.unit}s</p>
              </div>
            </div>

            <div className="space-y-3 p-5 bg-secondary/50 rounded-xl border border-border">
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="text-green-500" size={18} />
                <span>Verified Supplier: <strong>{product.supplierAlias}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Truck className="text-muted-foreground" size={18} />
                <span>Origin: {product.origin || "Ethiopia"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="text-muted-foreground" size={18} />
                <span>Typical response time: &lt; 2 hours</span>
              </div>
            </div>
          </div>

          {role === "wholesaler" && (
            <div className="flex gap-4 mt-auto">
              <Button size="lg" className="flex-1 h-14 text-base" onClick={handleStartDeal}>
                Start Negotiation
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-6">
                <MessageSquare size={20} className="mr-2" />
                Ask a Question
              </Button>
            </div>
          )}
          {role === "importer" && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
              <p className="text-primary font-medium">This is how wholesalers see your product.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

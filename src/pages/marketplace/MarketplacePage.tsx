import { useState } from "react";
import { Link } from "react-router-dom";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ShoppingCart, TrendingUp } from "lucide-react";
import { useMockAuth } from "@/hooks/useMockAuth";

const MOCK_PRODUCTS = [
  {
    _id: "p1",
    title: "Premium Ethiopian Coffee Beans (Yirgacheffe)",
    description: "Grade 1 washed coffee beans, ready for export or local roasting.",
    category: "Agriculture",
    price: 450.00,
    unit: "kg",
    minOrderQty: 100,
    stock: 5000,
    images: ["https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80"],
    supplierAlias: "Supplier-A9F2",
    tags: ["Export Quality", "Washed", "Grade 1"],
  },
  {
    _id: "p2",
    title: "Teff Flour (White)",
    description: "High quality white teff flour milled locally.",
    category: "Agriculture",
    price: 120.00,
    unit: "kg",
    minOrderQty: 50,
    stock: 2000,
    images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80"],
    supplierAlias: "Supplier-B3X1",
    tags: ["Gluten Free", "Organic"],
  },
  {
    _id: "p3",
    title: "Industrial Sewing Machines",
    description: "Heavy duty sewing machines for garment factories.",
    category: "Machinery",
    price: 25000.00,
    unit: "unit",
    minOrderQty: 5,
    stock: 45,
    images: ["https://images.unsplash.com/photo-1621252179027-94459d278660?w=500&q=80"],
    supplierAlias: "Supplier-C7L9",
    tags: ["Industrial", "Garment"],
  }
];

export default function MarketplacePage() {
  const containerRef = useGsapReveal<HTMLDivElement>();
  const [search, setSearch] = useState("");
  const { role } = useMockAuth();

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto" ref={containerRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 gsap-reveal">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground mt-1">Discover products from verified suppliers</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {role === "wholesaler" && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 flex items-center gap-4 gsap-reveal">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Wholesale Pricing Applied</h3>
            <p className="text-sm text-muted-foreground">All prices shown are your final buying price. No hidden fees.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Link 
            key={product._id} 
            to={`/marketplace/${product._id}`}
            className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 gsap-reveal"
          >
            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
              <img 
                src={product.images[0]} 
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-background/90 backdrop-blur text-foreground text-xs px-2.5 py-1 rounded-md font-medium">
                  {product.category}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                <span>{product.supplierAlias}</span>
                <span>Min Qty: {product.minOrderQty} {product.unit}</span>
              </div>
              <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {product.title}
              </h3>
              
              <div className="flex items-end justify-between mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price per {product.unit}</p>
                  <p className="text-xl font-bold text-foreground">
                    ETB {product.price.toLocaleString("en-ET", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <ShoppingCart size={18} />
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 gsap-reveal">
          <p className="text-muted-foreground text-lg">No products found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}

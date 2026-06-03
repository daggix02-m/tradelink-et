import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, UploadCloud, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function ImporterAddListing() {
  const containerRef = useGsapReveal<HTMLDivElement>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Product listed successfully!");
      navigate("/importer");
    }, 1200);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" ref={containerRef}>
      <Link to="/importer" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors gsap-reveal">
        <ArrowLeft size={16} className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="mb-8 gsap-reveal">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Listing</h1>
        <p className="text-muted-foreground">Add a new product to your inventory. The platform will automatically apply the category commission when wholesalers view it.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm gsap-reveal">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-border pb-2">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Title</label>
                <Input placeholder="e.g. Premium Teff Flour" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                  <option value="">Select a category</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Provide a detailed description of the product..."
                required
              />
            </div>
          </section>

          {/* Pricing & Inventory */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-border pb-2">Pricing & Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Raw Price (ETB)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">ETB</span>
                  <Input type="number" placeholder="0.00" className="pl-12" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Input placeholder="e.g. kg, ton, unit" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Order Qty</label>
                <Input type="number" placeholder="10" required />
              </div>
            </div>

            <div className="bg-secondary/50 border border-border rounded-lg p-4 flex gap-3">
              <Info className="text-muted-foreground shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-muted-foreground">
                Your <strong>Raw Price</strong> is what you get paid. Wholesalers will see a slightly higher price that includes the platform commission. You never pay any fees.
              </p>
            </div>
          </section>

          {/* Media */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-border pb-2">Media</h2>
            <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-secondary/20 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={24} />
              </div>
              <p className="font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, up to 5MB</p>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => navigate("/importer")}>
              Cancel
            </Button>
            <Button type="submit" className="min-w-[140px]" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                "Publish Listing"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

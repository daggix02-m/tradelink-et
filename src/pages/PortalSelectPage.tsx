import { Link } from "react-router-dom";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Building2, ShoppingCart, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PortalSelectPage() {
  const containerRef = useGsapReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen flex flex-col bg-background" ref={containerRef}>
      <header className="py-4 px-6 sm:px-12 w-full border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between">
        <Link to="/" className="text-xl font-bold font-display tracking-tight text-primary">
          TradeLink<span className="text-foreground">ET</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/admin/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline transition-all">
            Admin Portal
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full gsap-reveal">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              Choose Your Portal
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Select how you want to use TradeLink ET. Your experience is customized based on your business type.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Importer Portal Card */}
            <div className="group relative bg-card border border-border rounded-3xl p-8 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <Building2 size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-3">Importer / Manufacturer</h2>
                <p className="text-muted-foreground mb-8 min-h-[60px]">
                  List your products, reach verified local wholesalers, and manage your bulk sales directly.
                </p>
                <div className="space-y-3">
                  <Link 
                    to="/importer/login" 
                    className="flex items-center justify-between w-full bg-primary text-primary-foreground py-3 px-4 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                  >
                    <span>Login to Importer Portal</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link 
                    to="/importer/register" 
                    className="flex items-center justify-center w-full bg-secondary text-secondary-foreground py-3 px-4 rounded-xl font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <span>Create Importer Account</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Wholesaler Portal Card */}
            <div className="group relative bg-card border border-border rounded-3xl p-8 hover:border-secondary-foreground/50 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-foreground/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingCart size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-3">Wholesaler / Buyer</h2>
                <p className="text-muted-foreground mb-8 min-h-[60px]">
                  Source products directly from importers at zero-markup prices with secure escrow.
                </p>
                <div className="space-y-3">
                  <Link 
                    to="/wholesaler/login" 
                    className="flex items-center justify-between w-full bg-neutral-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-neutral-800 transition-colors"
                  >
                    <span>Login to Wholesaler Portal</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link 
                    to="/wholesaler/register" 
                    className="flex items-center justify-center w-full bg-secondary text-secondary-foreground py-3 px-4 rounded-xl font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <span>Create Wholesaler Account</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useGsapReveal } from "@/hooks/useGsapReveal";

export default function AdminDashboard() {
  const containerRef = useGsapReveal<HTMLDivElement>();

  return (
    <div className="p-6 max-w-7xl mx-auto" ref={containerRef}>
      <div className="mb-8 gsap-reveal">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 text-center gsap-reveal shadow-sm">
        <p className="text-muted-foreground">Admin statistics will appear here.</p>
      </div>
    </div>
  );
}

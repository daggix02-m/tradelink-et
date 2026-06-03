import { useGsapReveal } from "@/hooks/useGsapReveal";

export default function ImporterEarnings() {
  const containerRef = useGsapReveal<HTMLDivElement>();

  return (
    <div className="p-6 max-w-7xl mx-auto" ref={containerRef}>
      <div className="mb-8 gsap-reveal">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Earnings</h1>
        <p className="text-muted-foreground">View your payouts and transaction history.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 text-center gsap-reveal shadow-sm">
        <p className="text-muted-foreground">No earnings to display yet.</p>
      </div>
    </div>
  );
}

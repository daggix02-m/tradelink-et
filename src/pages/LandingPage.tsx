import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  TrendingDown,
  CreditCard,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Users,
  BarChart3,
  Clock,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

gsap.registerPlugin(ScrollTrigger);

// ─── Helper: split text into word spans ─────────────────────────────────────
function splitWords(el: HTMLElement) {
  const text = el.textContent ?? "";
  el.textContent = "";
  el.style.overflow = "hidden";
  const words = text.split(" ").filter(Boolean);
  words.forEach((word, i) => {
    const wrapper = document.createElement("span");
    wrapper.style.display = "inline-block";
    wrapper.style.overflow = "hidden";
    const inner = document.createElement("span");
    inner.style.display = "inline-block";
    inner.textContent = word + (i < words.length - 1 ? "\u00a0" : "");
    wrapper.appendChild(inner);
    el.appendChild(wrapper);
  });
  return el.querySelectorAll<HTMLSpanElement>("span > span");
}

// Pipeline steps data (shared between desktop + mobile views)
const PIPELINE_STEPS = [
  {
    step: "01",
    tag: "Smooth",
    tagColor: "text-blue-400 bg-blue-500/15 border-blue-500/20",
    title: "Anonymous Listing",
    desc: "Importers list their shipments without revealing their company name or identity. This prevents competitor price-war games, market manipulation, and bias — keeping every negotiation professional and focused purely on value.",
    icon: ShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    accent: "from-blue-500/10",
  },
  {
    step: "02",
    tag: "Fast",
    tagColor: "text-amber-400 bg-amber-500/15 border-amber-500/20",
    title: "Direct Bidding Portal",
    desc: "Wholesalers browse verified lots and place bids directly. An encrypted, confidential real-time portal lets buyers negotiate pricing, quantities, and terms directly with importers — closing deals in minutes, not weeks.",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    accent: "from-amber-500/10",
  },
  {
    step: "03",
    tag: "Reliable",
    tagColor: "text-purple-400 bg-purple-500/15 border-purple-500/20",
    title: "Chapa Escrow Deposit",
    desc: "Funds are locked in a secure trust escrow account via Chapa before any goods are moved. Telebirr, CBE Birr, and bank transfers are held safely — guaranteeing the buyer's payment is 100% protected and ready.",
    icon: CreditCard,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    accent: "from-purple-500/10",
  },
  {
    step: "04",
    tag: "Convenient",
    tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20",
    title: "Fulfillment & Auto-Release",
    desc: "The importer delivers the batch. Once the wholesaler inspects and confirms delivery, payment is automatically and instantly released to the importer. Zero friction, zero trust anxiety, zero delays.",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    accent: "from-emerald-500/10",
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);

  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef2 = useRef<HTMLDivElement>(null);

  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Track whether we're on mobile to conditionally run horizontal scroll
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Hero entrance ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (heroBadgeRef.current) {
        tl.fromTo(
          heroBadgeRef.current,
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6 },
          0
        );
      }

      const words = splitWords(heroRef.current!);
      tl.fromTo(
        words,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.07 },
        0.2
      );

      if (heroSubRef.current) {
        tl.fromTo(
          heroSubRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          0.6
        );
      }

      if (heroCtaRef.current) {
        const btns = heroCtaRef.current.querySelectorAll("a");
        tl.fromTo(
          btns,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 },
          0.8
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ── Scroll animations ────────────────────────────────────────────────────────
  useEffect(() => {
    let marqueeSection: Element | null = null;
    let onEnter: () => void = () => {};
    let onLeave: () => void = () => {};

    const ctx = gsap.context(() => {
      // 1. Feature cards stagger reveal
      gsap.fromTo(
        ".hero-feature-card",
        { opacity: 0, y: 50, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "power3.out", stagger: 0.12,
          scrollTrigger: {
            trigger: ".hero-features-grid",
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 2. Horizontal pinned scroll — DESKTOP ONLY (md and above)
      if (!isMobile && horizontalScrollRef.current && horizontalSectionRef.current) {
        const scrollEl = horizontalScrollRef.current;
        const pinEl = horizontalSectionRef.current;
        const cards = Array.from(scrollEl.querySelectorAll<HTMLElement>(".horizontal-card"));
        const getScrollAmount = () => -(scrollEl.scrollWidth - window.innerWidth + 80);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinEl,
            pin: true,
            pinSpacing: true,
            scrub: 1.2,
            start: "top top",
            end: () => `+=${Math.abs(getScrollAmount()) + window.innerWidth * 0.5}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressFillRef.current) {
                gsap.set(progressFillRef.current, {
                  scaleX: self.progress,
                  transformOrigin: "left center",
                });
              }
            },
          },
        });

        tl.fromTo(scrollEl, { x: 0 }, { x: getScrollAmount, ease: "none" });

        cards.forEach((card, i) => {
          if (i > 0) gsap.set(card, { opacity: 0.3, scale: 0.93 });
        });
        cards.forEach((card, i) => {
          if (i === 0) return;
          tl.fromTo(
            card,
            { opacity: 0.3, scale: 0.93 },
            { opacity: 1, scale: 1, ease: "power1.out" },
            (i - 1) * (0.85 / (cards.length - 1))
          );
        });
      }

      // 2b. Mobile pipeline cards — simple stagger reveal
      if (isMobile) {
        gsap.fromTo(
          ".mobile-pipeline-card",
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.1,
            scrollTrigger: {
              trigger: ".mobile-pipeline-section",
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3. Marquee
      marqueeSection = marqueeInnerRef.current?.closest("section") ?? null;
      const setupMarquee = (el: HTMLDivElement | null, direction: 1 | -1) => {
        if (!el) return null;
        const totalWidth = el.scrollWidth / 2;
        gsap.set(el, { x: direction === -1 ? 0 : -totalWidth });
        return gsap.to(el, { x: direction === -1 ? -totalWidth : 0, duration: 30, ease: "none", repeat: -1 });
      };
      const tween1 = setupMarquee(marqueeInnerRef.current, -1);
      const tween2 = setupMarquee(marqueeInnerRef2.current, 1);

      onEnter = () => { tween1?.timeScale(0.2); tween2?.timeScale(0.2); };
      onLeave = () => { tween1?.timeScale(1); tween2?.timeScale(1); };
      marqueeSection?.addEventListener("mouseenter", onEnter);
      marqueeSection?.addEventListener("mouseleave", onLeave);

      // 4. Stats counters
      const statData = [78, 3, 100];
      statRefs.current.forEach((el, i) => {
        if (!el) return;
        const obj = { val: 0 };
        ScrollTrigger.create({
          trigger: el, start: "top 85%", once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: statData[i], duration: 1.8, ease: "power2.out",
              onUpdate: () => {
                el.textContent = Math.round(obj.val) + (i === 2 ? "%" : i === 1 ? "min" : "+");
              },
            });
          },
        });
      });

      // 5. Benefits
      gsap.fromTo(".benefits-headline", { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: ".gsap-benefits-section", start: "top 80%", toggleActions: "play none none reverse" },
      });
      gsap.fromTo(".gsap-benefit-card", { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, duration: 0.6, ease: "power3.out", stagger: 0.15,
        scrollTrigger: { trigger: ".gsap-benefits-section", start: "top 75%", toggleActions: "play none none reverse" },
      });

      // 6. Comparison cards
      gsap.fromTo(".compare-card", { opacity: 0, y: 40, scale: 0.96 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "power3.out", stagger: 0.18,
        scrollTrigger: { trigger: ".compare-section", start: "top 80%", toggleActions: "play none none reverse" },
      });

      // 7. Parallax blobs
      gsap.to(".parallax-blob-1", { y: -120, ease: "none", scrollTrigger: { scrub: 1.5 } });
      gsap.to(".parallax-blob-2", { y: 140, ease: "none", scrollTrigger: { scrub: 1.5 } });

      // 8. Section headlines
      gsap.utils.toArray<HTMLElement>(".section-headline").forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 36 }, {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
        });
      });
    }, containerRef);

    return () => {
      ctx.revert();
      marqueeSection?.removeEventListener("mouseenter", onEnter);
      marqueeSection?.removeEventListener("mouseleave", onLeave);
    };
  }, [isMobile]);

  const stats = [
    { label: "Active traders growing", icon: Users },
    { label: "Average deal time", icon: Clock },
    { label: "Payment success rate", icon: BarChart3 },
  ];

  return (
    <div
      className="relative min-h-screen bg-background flex flex-col overflow-x-hidden select-none"
      ref={containerRef}
    >
      <DottedSurface className="opacity-20 dark:opacity-35" />

      {/* Parallax blobs — smaller on mobile */}
      <div className="parallax-blob-1 pointer-events-none absolute top-40 right-[-15%] sm:right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-500/6 blur-[100px] sm:blur-[130px] -z-10" />
      <div className="parallax-blob-2 pointer-events-none absolute top-[120vh] left-[-15%] sm:left-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-500/6 blur-[120px] sm:blur-[160px] -z-10" />

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-[20%] left-1/2 h-[80vh] w-full -translate-x-1/2 rounded-full",
          "bg-[radial-gradient(ellipse_at_center,rgba(0,123,255,0.07),transparent_60%)]",
          "blur-[60px] z-0"
        )}
      />

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative z-20 px-4 sm:px-8 lg:px-12 py-4 flex items-center justify-between border-b border-border/40 bg-background/30 backdrop-blur-xl">
        <div className="text-xl sm:text-2xl font-bold tracking-tighter text-primary flex items-center gap-2">
          <span>TradeLink</span>
          <span className="text-xs sm:text-sm font-semibold tracking-wide bg-primary/10 text-primary py-0.5 px-2 rounded-full">
            ET
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {/* Hide "Sign In" text on very small screens — only show Get Started */}
          <Link
            to="/portal-select"
            className="hidden sm:block text-sm font-medium hover:text-primary px-3 py-2 text-muted-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/portal-select"
            className="text-xs sm:text-sm font-medium bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10 whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 lg:py-36 text-center">
        <div className="max-w-4xl w-full space-y-6 sm:space-y-8">
          {/* Badge */}
          <div
            ref={heroBadgeRef}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mx-auto border border-primary/15"
            style={{ opacity: 0 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Ethiopia's Direct B2B Marketplace
          </div>

          {/* Headline */}
          <h1
            ref={heroRef}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.08] text-foreground"
            style={{ opacity: 0 }}
          >
            The Silent Broker for{" "}
            <span className="text-primary">Ethiopia's B2B Trade</span>.
          </h1>

          <p
            ref={heroSubRef}
            className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            style={{ opacity: 0 }}
          >
            TradeLink ET connects importers and wholesalers with complete anonymity. Negotiate,
            finalize deals, and manage payments securely — while we handle the trust.
          </p>

          <div
            ref={heroCtaRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2"
          >
            <Link
              to="/portal-select"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/10 flex items-center justify-center gap-2 text-sm sm:text-base"
              style={{ opacity: 0 }}
            >
              Start Trading Now{" "}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/marketplace"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-secondary/80 text-secondary-foreground font-medium rounded-xl hover:bg-secondary/60 transition-all hover:scale-105 active:scale-95 border border-border shadow-sm text-sm sm:text-base"
              style={{ opacity: 0 }}
            >
              Browse Marketplace
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-12 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-16 max-w-sm sm:max-w-xl w-full">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                ref={(el) => { statRefs.current[i] = el; }}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tighter text-foreground"
              >
                0
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="hero-features-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-20 max-w-5xl w-full">
          {[
            {
              title: "100% Anonymity",
              description: "Identities are hidden throughout negotiations — eliminating pricing games and protecting your business relationships.",
              icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10",
            },
            {
              title: "Zero Markup",
              description: "Buy directly at importer prices. Complete market transparency with no added broker fees or middle-man costs.",
              icon: TrendingDown, color: "text-green-500", bg: "bg-green-500/10",
            },
            {
              title: "Local Payments",
              description: "Integrated with Chapa — supporting Telebirr, CBE Birr, and all major Ethiopian banks for instant settlement.",
              icon: CreditCard, color: "text-purple-500", bg: "bg-purple-500/10",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="hero-feature-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-card/60 backdrop-blur-md border border-border text-left hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-primary/5 sm:col-span-1 col-span-1 last:sm:col-span-1 last:col-span-full last:md:col-span-1"
              style={{ opacity: 0 }}
            >
              <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6", feature.bg)}>
                <feature.icon className={feature.color} size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ─── Marquee Strip ──────────────────────────────────────────────────── */}
      <section className="relative py-6 sm:py-8 border-y border-border/25 bg-background overflow-hidden marquee-fade-edges">
        <div className="mb-2 overflow-hidden">
          <div ref={marqueeInnerRef} className="marquee-track flex whitespace-nowrap">
            {[0, 1].map((k) => (
              <span key={k} className="inline-flex shrink-0 text-[44px] sm:text-[68px] lg:text-[88px] font-black tracking-tighter text-primary/[0.09] dark:text-primary/[0.08] uppercase leading-none pr-8">
                Smooth&nbsp;•&nbsp;Fast&nbsp;•&nbsp;Reliable&nbsp;•&nbsp;Convenient&nbsp;•&nbsp;Anonymous&nbsp;•&nbsp;Secure&nbsp;•&nbsp;No&nbsp;Middlemen&nbsp;•&nbsp;
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div ref={marqueeInnerRef2} className="marquee-track flex whitespace-nowrap">
            {[0, 1].map((k) => (
              <span key={k} className="inline-flex shrink-0 text-[44px] sm:text-[68px] lg:text-[88px] font-black tracking-tighter text-foreground/[0.05] dark:text-foreground/[0.07] uppercase leading-none pr-8">
                Direct&nbsp;Trade&nbsp;•&nbsp;Escrow&nbsp;Protected&nbsp;•&nbsp;Telebirr&nbsp;Ready&nbsp;•&nbsp;CBE&nbsp;Integrated&nbsp;•&nbsp;Zero&nbsp;Markup&nbsp;•&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pipeline Section ────────────────────────────────────────────────── */}

      {/* MOBILE: vertical stacked cards */}
      <section className="mobile-pipeline-section md:hidden py-16 px-4 bg-neutral-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,123,255,0.07),transparent_55%)]" />
        <div className="relative space-y-4 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">The TradeLink Pipeline</p>
          <h2 className="text-3xl font-bold tracking-tighter leading-tight">
            A Smooth, Fast &amp; Convenient Deal Cycle
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Walk through every step of a secure B2B deal — from anonymous listing to instant payment release.
          </p>
        </div>
        <div className="relative space-y-4">
          {PIPELINE_STEPS.map((card, i) => (
            <div
              key={i}
              className={cn(
                "mobile-pipeline-card rounded-2xl border border-neutral-800 bg-gradient-to-br",
                card.accent, "to-neutral-900/80 p-5"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-extrabold tracking-tighter text-neutral-800 leading-none">{card.step}</span>
                <span className={cn("text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border", card.tagColor)}>{card.tag}</span>
              </div>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", card.bg)}>
                <card.icon className={card.color} size={18} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
          {/* End card */}
          <div className="mobile-pipeline-card rounded-2xl border border-dashed border-neutral-800 flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Deal Complete</h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-4">Payment released. Trust built. Trade done.</p>
            <Link to="/portal-select" className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              Start a Deal →
            </Link>
          </div>
        </div>
      </section>

      {/* DESKTOP: horizontal pinned scroll */}
      <section
        ref={horizontalSectionRef}
        className="relative hidden md:block min-h-screen bg-neutral-950 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,123,255,0.07),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.05),transparent_55%)]" />

        <div className="relative z-10 px-8 sm:px-16 pt-20 pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 max-w-[100vw]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">The TradeLink Pipeline</p>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter leading-tight section-headline" style={{ opacity: 0 }}>
              A Smooth, Fast &amp; <br className="hidden sm:block" />
              Convenient Deal Cycle
            </h2>
            <p className="text-neutral-400 max-w-md text-base lg:text-lg">
              Scroll to walk through every step of a secure B2B deal — from anonymous listing to instant payment release.
            </p>
          </div>
          <div className="flex items-center gap-3 text-neutral-500 text-sm">
            <div className="w-6 h-6 rounded-full border border-neutral-700 flex items-center justify-center animate-bounce">
              <ArrowRight size={12} className="rotate-90" />
            </div>
            <span>Scroll to explore</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 px-8 sm:px-16 mb-8">
          <div className="h-[2px] w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              ref={progressFillRef}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full"
              style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
            />
          </div>
        </div>

        {/* Scrollable track */}
        <div className="relative z-10 px-8 sm:px-16 pb-20 overflow-x-hidden">
          <div ref={horizontalScrollRef} className="flex gap-6 w-fit will-change-transform">
            {PIPELINE_STEPS.map((card, i) => (
              <div
                key={i}
                className={cn(
                  "horizontal-card shrink-0 w-[340px] lg:w-[440px] rounded-3xl border border-neutral-800",
                  "bg-gradient-to-br", card.accent,
                  "to-neutral-900/80 backdrop-blur-md flex flex-col justify-between p-8 h-[420px] lg:h-[440px]",
                  "hover:border-neutral-700 transition-colors duration-300"
                )}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[56px] font-extrabold tracking-tighter text-neutral-800 leading-none">{card.step}</span>
                    <span className={cn("text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border", card.tagColor)}>{card.tag}</span>
                  </div>
                  <div className="space-y-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.bg)}>
                      <card.icon className={card.color} size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{card.title}</h3>
                    <p className="text-neutral-400 text-[14px] leading-relaxed">{card.desc}</p>
                  </div>
                </div>
                <div className="border-t border-neutral-800 pt-4 flex items-center gap-2 text-xs text-neutral-600">
                  <CheckCircle2 size={12} className="text-neutral-700" />
                  Verified secure transaction step · Step {i + 1} of 4
                </div>
              </div>
            ))}
            {/* End card */}
            <div className="horizontal-card shrink-0 w-[280px] sm:w-[340px] rounded-3xl border border-dashed border-neutral-800 flex flex-col items-center justify-center text-center p-8 h-[420px] lg:h-[440px]">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="text-emerald-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Deal Complete</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Both parties are satisfied. Payment released. The trade is complete, transparent, and trustworthy.</p>
              <Link to="/portal-select" className="mt-6 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                Start a Deal →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Business Value Section ─────────────────────────────────────────── */}
      <section className="gsap-benefits-section py-16 sm:py-28 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-center benefits-headline" style={{ opacity: 0 }}>
            <div className="text-xs font-semibold tracking-widest text-primary uppercase">Boosting Ethiopian Commerce</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight text-foreground">
              Empowering the Backbone of Ethiopian B2B Trade
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Brokers and middle-men fragment the market and inflate costs. TradeLink ET aligns incentives — accelerating cash velocity and bulk trade for both importers and wholesalers.
            </p>
            <Link to="/portal-select" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all w-fit text-sm sm:text-base">
              Join the network <ArrowRight size={16} />
            </Link>
          </div>

          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {[
              {
                title: "For Importers & Manufacturers", color: "text-blue-500", bg: "bg-blue-500/10",
                points: [
                  { bold: "Move stock rapidly", rest: " by accessing verified, cash-ready wholesalers directly — no brokers needed." },
                  { bold: "Protect market pricing", rest: " by listing anonymously to prevent competitor price wars and market gaming." },
                  { bold: "Eliminate payment risk", rest: " with funds secured in escrow before any goods are dispatched." },
                ],
              },
              {
                title: "For Wholesalers & Buyers", color: "text-emerald-500", bg: "bg-emerald-500/10",
                points: [
                  { bold: "Access zero-markup prices", rest: " directly from the source — no broker fees eating into your margins." },
                  { bold: "Transact confidently", rest: " with local Chapa gateway support — Telebirr, CBE Birr, and all major banks." },
                  { bold: "Build reliable supply lines", rest: " without broker bias, identity gatekeeping, or relationship fragility." },
                ],
              },
              {
                title: "For Ethiopia's Growing Economy", color: "text-purple-500", bg: "bg-purple-500/10",
                points: [
                  { bold: "Increase trade transparency", rest: " through systematic anonymous, auditable listings and deal records." },
                  { bold: "Accelerate deal velocity", rest: " by automating every step of the transaction logistics chain." },
                  { bold: "Build institutional trust", rest: " backed by integrated, regulated local electronic payment security." },
                ],
              },
            ].map((block, i) => (
              <div
                key={i}
                className="gsap-benefit-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-card border border-border flex gap-4 sm:gap-5 hover:shadow-lg hover:border-border/80 transition-all duration-300"
                style={{ opacity: 0 }}
              >
                <div className={cn("w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 mt-1", block.bg)}>
                  <CheckCircle2 className={block.color} size={20} />
                </div>
                <div className="space-y-2 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">{block.title}</h3>
                  <ul className="text-muted-foreground leading-relaxed space-y-1.5 text-xs sm:text-sm">
                    {block.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", block.bg.replace("/10", "/50"))} />
                        <span><strong className="text-foreground/80">{pt.bold}</strong>{pt.rest}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison Section ─────────────────────────────────────────────── */}
      <section className="compare-section py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-background border-t border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.04),transparent_55%)]" />
        <div className="max-w-5xl mx-auto w-full space-y-10 sm:space-y-16 relative z-10">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tighter section-headline" style={{ opacity: 0 }}>
              Smooth. Reliable. Convenient.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              See how TradeLink ET completely transforms traditional B2B trading dynamics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Traditional */}
            <div className="compare-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border border-border space-y-5 sm:space-y-6" style={{ opacity: 0 }}>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-rose-500">
                  <AlertCircle size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Traditional Route</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Broker-Dominated Dynamics</h3>
                <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                  B2B trading is plagued by identity exposure, hidden markups, payment delays, and trust fragility. Deals take weeks. Disputes take months.
                </p>
              </div>
              <div className="border-t border-border pt-4 sm:pt-5 space-y-2.5 sm:space-y-3">
                {["Identities exposed — leading to pricing games", "Slow, unsecure banking settlement delays", "Multiple layers of middle-man markups", "Fragile trust with zero payment guarantees"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-muted-foreground text-xs sm:text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />{item}
                  </div>
                ))}
              </div>
            </div>

            {/* TradeLink ET */}
            <div
              className="compare-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/[0.04] to-card border border-primary/20 space-y-5 sm:space-y-6 relative"
              style={{ opacity: 0 }}
            >
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-primary/10 text-primary border border-primary/20 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-2 sm:px-2.5 py-1 rounded-full">
                Optimized
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">TradeLink ET</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Seamless &amp; Silent Trading</h3>
                <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                  We act as the trusted, silent infrastructure layer. Everything is automated, anonymous, and protected by local payment trust rails.
                </p>
              </div>
              <div className="border-t border-border pt-4 sm:pt-5 space-y-2.5 sm:space-y-3">
                {["Complete identity privacy throughout all negotiations", "Secure escrow protecting both buyer and seller", "Instant local gateway processing via Chapa", "Automated dispute-free payment release on delivery"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-foreground/80 text-xs sm:text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-28 px-4 sm:px-6 text-center bg-card relative z-10 border-t border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,123,255,0.05),transparent_60%)]" />
        <div className="max-w-2xl mx-auto space-y-5 sm:space-y-7 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter section-headline" style={{ opacity: 0 }}>
            Ready to Trade Smarter?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
            Create your account today and experience B2B trading with complete trust, speed, and anonymity.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
            <Link
              to="/portal-select"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/10 text-sm sm:text-base"
            >
              Create Importer Account
            </Link>
            <Link
              to="/portal-select"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all hover:scale-105 active:scale-95 border border-border text-sm sm:text-base"
            >
              Create Wholesaler Account
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-background py-6 sm:py-8 px-4 sm:px-8 lg:px-12 border-t border-border/30 text-xs sm:text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center">
        <div className="font-medium text-foreground/60">
          © {new Date().getFullYear()} TradeLink ET — Ethiopia's Direct B2B Platform
        </div>
        <div className="flex gap-4 sm:gap-6">
          <Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
          <Link to="/portal-select" className="hover:text-foreground transition-colors">Portal</Link>
        </div>
      </footer>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal(options?: {
  trigger?: string;
  start?: string;
  stagger?: number;
  y?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const targets = ref.current!.querySelectorAll(".gsap-reveal");
      if (!targets.length) return;

      gsap.fromTo(
        targets,
        { opacity: 0, y: options?.y ?? 32, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: options?.duration ?? 0.6,
          ease: "power2.out",
          stagger: options?.stagger ?? 0.1,
          scrollTrigger: {
            trigger: ref.current,
            start: options?.start ?? "top 85%",
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return ref;
}
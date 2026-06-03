import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "./useReducedMotion";

export function usePageTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current!,
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return ref;
}
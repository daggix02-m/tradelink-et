import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "./useReducedMotion";

export function useStaggerAnimation(options?: {
  stagger?: number;
  y?: number;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const children = ref.current!.children;
      if (!children.length) return;

      gsap.fromTo(
        children,
        { opacity: 0, y: options?.y ?? 24 },
        {
          opacity: 1,
          y: 0,
          duration: options?.duration ?? 0.5,
          ease: "power2.out",
          stagger: options?.stagger ?? 0.05,
          delay: options?.delay ?? 0,
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return ref;
}
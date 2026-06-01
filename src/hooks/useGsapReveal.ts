import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Attach a GSAP stagger reveal to all `.gsap-reveal` children
 * inside the returned ref. Safe with React StrictMode.
 */
export function useGsapReveal(options?: {
  delay?: number;
  stagger?: number;
  scroll?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const targets = ref.current!.querySelectorAll(".gsap-reveal");
      if (!targets.length) return;

      if (options?.scroll) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            stagger: options.stagger ?? 0.09,
            delay: options.delay ?? 0,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      } else {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: options?.stagger ?? 0.08,
            delay: options?.delay ?? 0,
          }
        );
      }
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}

/** Hook for a single element entrance animation */
export function useGsapEntrance(
  animation: "fadeUp" | "slideLeft" | "slideRight" | "scaleIn" = "fadeUp",
  delay = 0
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const from: gsap.TweenVars = { opacity: 0 };
      if (animation === "fadeUp") from.y = 24;
      if (animation === "slideLeft") from.x = -32;
      if (animation === "slideRight") from.x = 32;
      if (animation === "scaleIn") from.scale = 0.92;

      gsap.fromTo(ref.current!, from, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration: 0.5,
        ease: animation === "scaleIn" ? "back.out(1.4)" : "power2.out",
        delay,
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}

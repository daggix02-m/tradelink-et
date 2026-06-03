import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  delay?: number;
  stagger?: number;
  scroll?: boolean;
}) {
  const ref = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;

    if (prefersReducedMotion) {
      const targets = ref.current.querySelectorAll(".gsap-reveal");
      targets.forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }

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
            duration: 0.6,
            ease: "power3.out",
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
            duration: 0.6,
            ease: "power3.out",
            stagger: options?.stagger ?? 0.08,
            delay: options?.delay ?? 0,
          }
        );
      }
    }, ref);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return ref;
}

export function useGsapEntrance(
  animation: "fadeUp" | "slideLeft" | "slideRight" | "scaleIn" = "fadeUp",
  delay = 0
) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;

    if (prefersReducedMotion) {
      (ref.current as HTMLElement).style.opacity = "1";
      (ref.current as HTMLElement).style.transform = "none";
      return;
    }

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
        duration: 0.6,
        ease: animation === "scaleIn" ? "back.out(1.4)" : "power3.out",
        delay,
      });
    }, ref);

    return () => ctx.revert();
  }, [animation, delay, prefersReducedMotion]);

  return ref;
}
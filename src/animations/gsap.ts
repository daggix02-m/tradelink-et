import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Page entrance animations ────────────────────────────────────────────────

/** Stagger-reveal all `.gsap-reveal` elements in a container */
export function revealStagger(
  container: string | Element = "body",
  options?: { delay?: number; stagger?: number }
) {
  const { delay = 0, stagger = 0.08 } = options ?? {};

  return gsap.fromTo(
    `${typeof container === "string" ? container + " " : ""}${
      typeof container !== "string" ? container : ""
    } .gsap-reveal`,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: "power2.out",
      stagger,
      delay,
    }
  );
}

/** Animate a single element in from the left */
export function slideInLeft(el: Element | string, delay = 0) {
  return gsap.fromTo(
    el,
    { opacity: 0, x: -32 },
    { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", delay }
  );
}

/** Animate a single element in from the right */
export function slideInRight(el: Element | string, delay = 0) {
  return gsap.fromTo(
    el,
    { opacity: 0, x: 32 },
    { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", delay }
  );
}

/** Scale in with fade */
export function scaleIn(el: Element | string, delay = 0) {
  return gsap.fromTo(
    el,
    { opacity: 0, scale: 0.92 },
    { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)", delay }
  );
}

// ─── Scroll-triggered reveals ────────────────────────────────────────────────

/** Set up scroll-triggered stagger for a section */
export function scrollReveal(
  trigger: string | Element,
  targets?: string
) {
  const targetSel = targets ?? ".gsap-reveal";

  return gsap.fromTo(
    typeof trigger === "string"
      ? `${trigger} ${targetSel}`
      : trigger.querySelectorAll(targetSel),
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger,
        start: "top 85%",
        once: true,
      },
    }
  );
}

/** Hero headline character-by-character reveal */
export function heroReveal(headlineEl: Element | string) {
  const tl = gsap.timeline();

  tl.fromTo(
    headlineEl,
    { opacity: 0, y: 40, skewY: 3 },
    { opacity: 1, y: 0, skewY: 0, duration: 0.8, ease: "power3.out" }
  );

  return tl;
}

/** Card hover lift effect */
export function cardHoverBind(selector: string) {
  const cards = document.querySelectorAll(selector);
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { y: -4, duration: 0.2, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { y: 0, duration: 0.2, ease: "power2.in" });
    });
  });
}

/** Number counter animation (for dashboard stats) */
export function countUp(
  el: Element | string,
  target: number,
  options?: { duration?: number; prefix?: string; suffix?: string }
) {
  const { duration = 1.5, prefix = "", suffix = "" } = options ?? {};
  const obj = { value: 0 };

  return gsap.to(obj, {
    value: target,
    duration,
    ease: "power1.out",
    onUpdate() {
      const node =
        typeof el === "string" ? document.querySelector(el) : el;
      if (node) {
        node.textContent =
          prefix + Math.round(obj.value).toLocaleString("en-ET") + suffix;
      }
    },
  });
}

/** Smooth page transition out (call before route change) */
export function pageTransitionOut(container: Element | string = "#root") {
  return gsap.to(container, {
    opacity: 0,
    y: -12,
    duration: 0.22,
    ease: "power2.in",
  });
}

/** Smooth page transition in (call after route change) */
export function pageTransitionIn(container: Element | string = "#root") {
  return gsap.fromTo(
    container,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
  );
}

export { gsap, ScrollTrigger };

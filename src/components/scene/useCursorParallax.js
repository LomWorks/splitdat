import { useEffect, useRef } from "react";

const isDesktopPointer =
  typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useCursorParallaxRef() {
  const parallaxRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDesktopPointer || prefersReducedMotion) return undefined;

    function handleMove(event) {
      parallaxRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return parallaxRef;
}
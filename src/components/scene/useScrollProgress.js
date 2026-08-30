import { useEffect, useRef } from "react";

export function useScrollProgressRef() {
  const progressRef = useRef(0);

  useEffect(() => {
    function updateProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current = scrollable > 0 ? window.scrollY / scrollable : 0;
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return progressRef;
}
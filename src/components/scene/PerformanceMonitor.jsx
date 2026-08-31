/**
 * Drop-in FPS / frame-time monitor for the @react-three/fiber Canvas.
 *
 * Renders nothing visually — hooks useFrame to sample timing and reports
 * up to a parent-supplied callback (e.g. into the execution log).
 *
 * Usage inside <Canvas>:
 *   <PerformanceMonitor onSample={(stats) => console.log(stats)} sampleEveryMs={1000} />
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function PerformanceMonitor({ onSample, sampleEveryMs = 1000 }) {
  const frameCount = useRef(0);
  const lastSampleTime = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    frameCount.current += 1;

    const elapsed = now - lastSampleTime.current;
    if (elapsed >= sampleEveryMs) {
      const fps = Math.round((frameCount.current / elapsed) * 1000);
      const frameTimeMs = Math.round((elapsed / frameCount.current) * 100) / 100;

      onSample?.({
        fps,
        frameTimeMs,
        timestamp: new Date().toISOString(),
      });

      frameCount.current = 0;
      lastSampleTime.current = now;
    }
  });

  return null;
}
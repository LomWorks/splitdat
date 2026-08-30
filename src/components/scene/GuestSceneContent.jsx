import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import InteractiveCard from "./InteractiveCard.jsx";
import { useScrollProgressRef } from "./useScrollProgress.js";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function GuestSceneContent() {
  const groupRef = useRef();
  const scrollProgress = useScrollProgressRef();

  const cards = useMemo(
    () => [
      { position: [-2.2, 0.4, -2], tilt: 0.3 },
      { position: [2.4, -0.6, -3], tilt: -0.4, scale: 0.85 },
      { position: [0.4, 1.2, -4], tilt: 0.15, scale: 1.1 },
    ],
    [],
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = scrollProgress.current * 1.5; // tune parallax distance to taste
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      Math.min(delta * 4, 1),
    );
  });

  return (
    <group ref={groupRef}>
      {cards.map((card, index) =>
        prefersReducedMotion ? (
          <InteractiveCard key={index} {...card} />
        ) : (
          <Float
            key={index}
            speed={1.2}
            rotationIntensity={0.4}
            floatIntensity={0.6}
            floatingRange={[-0.15, 0.15]}
          >
            <InteractiveCard {...card} />
          </Float>
        ),
      )}
    </group>
  );
}
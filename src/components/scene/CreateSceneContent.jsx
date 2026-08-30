import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import InteractiveCard from "./InteractiveCard.jsx";
import { useScrollProgressRef } from "./useScrollProgress.js";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function CreateSceneContent() {
  const groupRef = useRef();
  const scrollProgress = useScrollProgressRef();

  const cards = useMemo(() => [{ position: [0, -0.2, -4], tilt: 0.1 }], []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = scrollProgress.current * 1.5;
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
            speed={0.6}
            rotationIntensity={0.15}
            floatIntensity={0.3}
            floatingRange={[-0.08, 0.08]}
          >
            <InteractiveCard {...card} />
          </Float>
        ),
      )}
    </group>
  );
}
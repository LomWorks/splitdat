import { useMemo } from "react";
import { ambientLight, directionalLight, planeGeometry, meshStandardMaterial } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";

// TODO: swap for the real hex behind --butter-100 / --blue-600
const PAPER_COLOR = "#f6efe2";
const ACCENT_COLOR = "#5c7c93";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function ReceiptCard({ position, tilt, scale = 1 }) {
  const card = (
    <mesh position={position} rotation={[0, tilt, 0]} scale={scale}>
      <planeGeometry args={[1.2, 2]} />
      <meshStandardMaterial color={PAPER_COLOR} roughness={0.9} side={2} />
    </mesh>
  );

  // Float wraps in its own animation loop — skip it entirely for reduced motion
  // rather than rendering it disabled.
  if (prefersReducedMotion) return card;

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6} floatingRange={[-0.15, 0.15]}>
      {card}
    </Float>
  );
}

export default function ReceiptScene() {
  const cards = useMemo(
    () => [
      { position: [-2.2, 0.4, -2], tilt: 0.3 },
      { position: [2.4, -0.6, -3], tilt: -0.4, scale: 0.85 },
      { position: [0.4, 1.2, -4], tilt: 0.15, scale: 1.1 },
    ],
    [],
  );

  return (
    <>
      <ambientLight args={[{ intensity: 0.5, color: PAPER_COLOR }]} />
      <directionalLight args={[{ position: [3, 5, 4], intensity: 0.6, color: ACCENT_COLOR }]} />
      <Environment preset="apartment" />

      {cards.map((card, index) => (
        <ReceiptCard key={index} {...card} />
      ))}
    </>
  );
}
import { useMemo } from "react";
import { Float, Environment } from "@react-three/drei";

const PAPER_COLOR = "#fff7d7"; // --butter-100
const ACCENT_COLOR = "#5c7c93"; // --blue-600

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
      <ambientLight intensity={0.5} color={PAPER_COLOR} />
      <directionalLight position={[3, 5, 4]} intensity={0.6} color={ACCENT_COLOR} />
      <Environment preset="apartment" />

      {cards.map((card, index) => (
        <ReceiptCard key={index} {...card} />
      ))}
    </>
  );
}
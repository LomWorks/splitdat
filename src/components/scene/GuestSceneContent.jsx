import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useScrollProgressRef } from "./useScrollProgress.js";

const BUTTER_50 = "#fffdf3";
const BUTTER_100 = "#fff7d7";
const BLUE_600 = "#5c7c93";
const BLUE_300 = "#b9cbd4";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function ReceiptSlip({ position, rotation, color = BUTTER_50, index = 0 }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[1.3, 2.2]} />
        <meshStandardMaterial color={color} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Line strips */}
      {[0.6, 0.35, 0.1, -0.15].map((y, i) => (
        <mesh key={i} position={[0, y, 0.01]}>
          <planeGeometry args={[1.1, 0.12]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? BLUE_300 : BLUE_600}
            roughness={0.7}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

function SplitLine() {
  const lineRef = useRef();
  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    lineRef.current.material.opacity =
      0.4 + Math.sin(clock.elapsedTime * 1.5) * 0.2;
  });

  return (
    <mesh ref={lineRef} position={[0, 0, -3.5]}>
      <planeGeometry args={[3, 0.03]} />
      <meshBasicMaterial color={BLUE_600} transparent opacity={0.4} />
    </mesh>
  );
}

export default function GuestSceneContent() {
  const groupRef = useRef();
  const scrollProgress = useScrollProgressRef();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = scrollProgress.current * 1.2;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      Math.min(delta * 3, 1),
    );
  });

  const slips = [
    { position: [-1.8, 0.3, -4], rotation: [0.05, 0.3, -0.08], color: BUTTER_50 },
    { position: [-0.6, 0.1, -3.5], rotation: [0.02, 0.1, 0.04], color: BUTTER_100 },
    { position: [0.6, -0.1, -3.8], rotation: [-0.03, -0.15, 0.06], color: BUTTER_50 },
    { position: [1.8, -0.3, -4.2], rotation: [0.04, -0.28, -0.05], color: BUTTER_100 },
  ];

  return (
    <group ref={groupRef}>
      {slips.map((slip, index) =>
        prefersReducedMotion ? (
          <ReceiptSlip key={index} {...slip} index={index} />
        ) : (
          <Float
            key={index}
            speed={0.4 + index * 0.1}
            rotationIntensity={0.08}
            floatIntensity={0.15}
            floatingRange={[-0.08, 0.08]}
          >
            <ReceiptSlip {...slip} index={index} />
          </Float>
        ),
      )}
      <SplitLine />
    </group>
  );
}
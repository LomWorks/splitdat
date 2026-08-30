import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useScrollProgressRef } from "./useScrollProgress.js";
import { useCursorParallaxRef } from "./useCursorParallax.js";

const BUTTER_100 = "#fff7d7";
const BUTTER_50 = "#fffdf3";
const BLUE_600 = "#5c7c93";
const BLUE_300 = "#b9cbd4";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Tabletop() {
  return (
    <mesh position={[0, -1.2, -5]} rotation={[-Math.PI * 0.15, 0, 0]} receiveShadow>
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial color={BUTTER_100} roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

// A single line-item strip that scales/fades in once scroll passes its threshold —
// snaps instantly under reduced motion instead of animating.
function LineStrip({ y, color, revealAt, scrollProgress }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const revealed = scrollProgress.current >= revealAt;
    const targetScale = revealed ? 1 : 0;
    const targetOpacity = revealed ? 0.75 : 0;

    if (prefersReducedMotion) {
      meshRef.current.scale.x = targetScale;
      meshRef.current.material.opacity = targetOpacity;
      return;
    }

    const t = Math.min(delta * 5, 1);
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, t);
    meshRef.current.material.opacity = THREE.MathUtils.lerp(
      meshRef.current.material.opacity,
      targetOpacity,
      t,
    );
  });

  return (
    <mesh ref={meshRef} position={[0, y, 0.01]} scale={[0, 1, 1]}>
      <planeGeometry args={[1.2, 0.15]} />
      <meshStandardMaterial color={color} roughness={0.7} transparent opacity={0} />
    </mesh>
  );
}

function Receipt({ scrollProgress }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const bob = prefersReducedMotion ? 0 : Math.sin(clock.getElapsedTime() * 0.6) * 0.06;
    groupRef.current.position.y = -0.3 + scrollProgress.current * 0.8 + bob;
  });

  return (
    <group ref={groupRef} position={[0, -0.3, -3.5]}>
      {/* Billboard = always faces the camera, per spec */}
      <Billboard>
        <mesh castShadow>
          <planeGeometry args={[1.4, 2.4]} />
          <meshStandardMaterial color={BUTTER_50} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>

        <LineStrip y={0.7} color={BLUE_300} revealAt={0.15} scrollProgress={scrollProgress} />
        <LineStrip y={0.45} color={BLUE_600} revealAt={0.3} scrollProgress={scrollProgress} />
        <LineStrip y={0.2} color={BLUE_300} revealAt={0.45} scrollProgress={scrollProgress} />
      </Billboard>
    </group>
  );
}

function CoffeeCup() {
  return (
    <group position={[-2.2, -0.8, -4]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.7, 12]} />
        <meshStandardMaterial color={BUTTER_100} roughness={0.6} />
      </mesh>
      <mesh position={[0.4, 0.1, 0]}>
        <torusGeometry args={[0.2, 0.08, 8, 12]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Plate() {
  return (
    <mesh position={[2, -0.95, -4.5]} rotation={[0, 0.3, 0]} receiveShadow>
      <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
      <meshStandardMaterial color={BUTTER_50} roughness={0.7} metalness={0.15} />
    </mesh>
  );
}

function Coin() {
  return (
    <mesh position={[-1, -0.9, -3.8]} rotation={[Math.PI * 0.3, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
      <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={0.8} />
    </mesh>
  );
}

function ReceiptClip() {
  return (
    <mesh position={[0.6, 1, -3.4]} rotation={[0.1, 0, 0.3]} castShadow>
      <boxGeometry args={[0.12, 0.6, 0.08]} />
      <meshStandardMaterial color="#6b7f8f" roughness={0.5} metalness={0.7} />
    </mesh>
  );
}

// Wraps children in Float when motion is allowed, renders them bare otherwise —
// this is the piece that was declared but never actually wired in before.
function Motion({ children, ...floatProps }) {
  if (prefersReducedMotion) return children;
  return <Float {...floatProps}>{children}</Float>;
}

export default function CreateSceneContent() {
  const groupRef = useRef();
  const scrollProgress = useScrollProgressRef();
  const cursorParallax = useCursorParallaxRef();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = Math.min(delta * 2, 1);

    const targetZ = -5 + scrollProgress.current * 0.5;
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, t);

    // Subtle cursor parallax tilt — cursorParallax stays {0,0} on touch/reduced-motion,
    // so this is a no-op there rather than needing a separate check.
    const targetRotY = cursorParallax.current.x * 0.05;
    const targetRotX = cursorParallax.current.y * 0.03;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, t);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, t);
  });

  return (
    <group ref={groupRef}>
      <Tabletop />

      <Receipt scrollProgress={scrollProgress} />

      <Motion speed={0.4} rotationIntensity={0.12} floatIntensity={0.15} floatingRange={[-0.1, 0.1]}>
        <CoffeeCup />
      </Motion>

      <Motion speed={0.35} rotationIntensity={0.05} floatIntensity={0.1}>
        <Plate />
      </Motion>

      <Motion speed={0.6} rotationIntensity={0.2} floatIntensity={0.25} floatingRange={[-0.15, 0.15]}>
        <Coin />
      </Motion>

      <Motion speed={0.45} rotationIntensity={0.1} floatIntensity={0.12}>
        <ReceiptClip />
      </Motion>

      {/* Cheap soft-shadow approximation — a single blurred-looking dark plane
          under the scene, rather than per-object shadow maps (perf trade-off). */}
      <mesh position={[0, -1.18, -4]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}
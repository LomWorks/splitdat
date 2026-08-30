import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PAPER_COLOR = "#fff7d7"; // --butter-100
const ACCENT_COLOR = "#5c7c93"; // --blue-600

export default function InteractiveCard({ position, tilt = 0, scale = 1 }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const targetScale = hovered ? scale * 1.15 : scale;
    const targetRotationY = tilt + (flipped ? Math.PI : 0);
    const t = Math.min(delta * 6, 1);

    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, t),
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotationY,
      t,
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[0, tilt, 0]}
      scale={scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFlipped((current) => !current);
      }}
    >
      <planeGeometry args={[1.2, 2]} />
      <meshStandardMaterial
        color={hovered ? ACCENT_COLOR : PAPER_COLOR}
        roughness={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
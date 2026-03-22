"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function ParticleBackground() {
  const ref = useRef<THREE.Points>(null!);
  
  const stride = 3;
  const numParticles = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(numParticles * stride);
    for (let i = 0; i < numParticles; i++) {
      pos[i * stride] = (Math.random() - 0.5) * 10;
      pos[i * stride + 1] = (Math.random() - 0.5) * 10;
      pos[i * stride + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [numParticles]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.02;
    ref.current.rotation.x = t * 0.01;
    ref.current.position.y = Math.sin(t * 0.5) * 0.1;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={stride} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00f2ff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.4}
        />
      </Points>
    </group>
  );
}

function FloatingOrbs() {
  const meshRef = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.children.forEach((child, i) => {
      child.position.y += Math.sin(t + i) * 0.002;
      child.position.x += Math.cos(t + i) * 0.001;
    });
  });

  return (
    <group ref={meshRef}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 2]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshBasicMaterial color="#7000ff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={0.5} />
        <ParticleBackground />
        <FloatingOrbs />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />
    </div>
  );
}

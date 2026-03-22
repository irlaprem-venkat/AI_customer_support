"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// Custom Iridescent Refractive Shader
const IridescentShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(0, 0) },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - dot(normal, viewDir), 2.5);
      
      // Chromatic Aberration Simulation
      float r = pow(1.0 - dot(normal, viewDir), 3.0);
      float g = pow(1.0 - dot(normal, viewDir), 3.5);
      float b = pow(1.0 - dot(normal, viewDir), 4.0);
      
      vec3 iridescence = vec3(
        mix(0.5, 1.0, r),
        mix(0.0, 1.0, g),
        mix(1.0, 0.5, b)
      );
      
      // Animate color shifts
      iridescence.r += sin(uTime * 1.2) * 0.1;
      iridescence.g += cos(uTime * 0.8) * 0.1;
      iridescence.b += sin(uTime * 0.5) * 0.1;
      
      vec3 baseColor = mix(vec3(0.05), iridescence, fresnel);
      gl_FragColor = vec4(baseColor, 0.3 + fresnel * 0.7);
    }
  `,
};

function FracturedFragments() {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const echoRef = useRef<THREE.InstancedMesh>(null!);
  const { size } = useThree();
  
  const fragments = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale: 0.2 + Math.random() * 0.8,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01),
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }
    return temp;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
  }), [size]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    uniforms.uTime.value = t;
    const dummy = new THREE.Object3D();
    const mouse = new THREE.Vector3(state.pointer.x * 5, state.pointer.y * 5, 0);

    fragments.forEach((f, i) => {
      // Gravity / Attraction to Mouse
      const dist = f.position.distanceTo(mouse);
      if (dist < 4) {
        const force = (4 - dist) * 0.005;
        f.velocity.add(new THREE.Vector3().subVectors(mouse, f.position).multiplyScalar(force));
      }

      // Natural movement & damping
      f.position.add(f.velocity);
      f.velocity.multiplyScalar(0.95);
      f.rotation.x += f.rotationSpeed + Math.sin(t * 0.5) * 0.01;
      f.rotation.y += f.rotationSpeed + Math.cos(t * 0.3) * 0.01;

      // Bounds check
      if (Math.abs(f.position.x) > 10) f.velocity.x *= -0.5;
      if (Math.abs(f.position.y) > 8) f.velocity.y *= -0.5;
      if (Math.abs(f.position.z) > 5) f.velocity.z *= -0.5;

      dummy.position.copy(f.position);
      dummy.rotation.copy(f.rotation);
      // Dimension Folding (Interactive scale morphing)
      const folding = 1.0 + Math.sin(t * 0.5 + i) * 0.2;
      dummy.scale.set(f.scale * folding, f.scale / folding, f.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Memory Echo (Lagged position)
      dummy.position.add(f.velocity.clone().multiplyScalar(-10));
      dummy.scale.multiplyScalar(0.8);
      dummy.updateMatrix();
      echoRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    echoRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={echoRef} args={[undefined, undefined, count]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.05} />
      </instancedMesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <octahedronGeometry args={[1, 0]} />
        <shaderMaterial 
          transparent 
          uniforms={uniforms}
          vertexShader={IridescentShader.vertexShader}
          fragmentShader={IridescentShader.fragmentShader}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </>
  );
}

// Memory Echo / Temporal Distortion Effect (CSS + Canvas Layer)
function MemoryEcho() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20 filter blur-xl mix-blend-screen overflow-hidden">
      <div className="absolute w-full h-full animate-[ping_10s_linear_infinite] bg-gradient-to-tr from-purple-500/20 via-transparent to-cyan-500/20" />
    </div>
  );
}

export default function RealityFoldingBackground() {
  const [shockwave, setShockwave] = useState(false);

  return (
    <div 
      className="fixed inset-0 -z-10 bg-black overflow-hidden"
      onClick={() => {
        setShockwave(true);
        setTimeout(() => setShockwave(false), 1000);
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#fff" />
        <FracturedFragments />
      </Canvas>
      <MemoryEcho />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />
      
      {/* Shockwave visual */}
      <AnimatePresence>
        {shockwave && (
          <motion.div
            initial={{ scale: 0, opacity: 1, border: "2px solid white" }}
            animate={{ scale: 10, opacity: 0, border: "0px solid white" }}
            transition={{ duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none z-0"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

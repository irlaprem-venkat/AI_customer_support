"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// GLSL Shader for Liquid Glass Morphing Surface
const LiquidGlassShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(0, 0) },
    uIntensity: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      // Add subtle wave displacement
      float displacement = sin(position.x * 2.0 + uTime) * 0.1 + 
                          sin(position.y * 2.0 + uTime * 0.5) * 0.1;
      
      vec3 newPosition = position + normal * displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec2 st = vUv;
      float d = distance(st, uMouse * 0.5 + 0.5);
      
      // Liquid color shifting
      vec3 color1 = vec3(0.0, 0.95, 1.0); // Cyan
      vec3 color2 = vec3(0.44, 0.0, 1.0); // Purple
      vec3 color3 = vec3(1.0, 0.0, 0.78); // Pink
      
      float mixVal = sin(st.x * 3.0 + uTime * 0.5) * 0.5 + 0.5;
      vec3 baseColor = mix(color1, color2, mixVal);
      baseColor = mix(baseColor, color3, sin(uTime * 0.2) * 0.5 + 0.5);
      
      // Glass refractions effect
      float glass = 1.0 - smoothstep(0.0, 0.8, d);
      vec3 finalColor = baseColor * (0.1 + glass * uIntensity);
      
      gl_FragColor = vec4(finalColor, 0.15);
    }
  `,
};

function FluidSurface() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { size } = useThree();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uIntensity: { value: 0.5 },
  }), [size]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    uniforms.uTime.value = t;
    uniforms.uMouse.value.lerp(state.pointer, 0.1);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <planeGeometry args={[20, 20, 64, 64]} />
      <shaderMaterial 
        transparent 
        uniforms={uniforms}
        vertexShader={LiquidGlassShader.vertexShader}
        fragmentShader={LiquidGlassShader.fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function NeuralGrid() {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const lineRef = useRef<THREE.LineSegments>(null!);
  const pulseMeshRef = useRef<THREE.InstancedMesh>(null!);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 5;
      temp.push({ x, y, z, velocity: new THREE.Vector3((Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005) });
    }
    return temp;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const dummy = new THREE.Object3D();
    const pulseDummy = new THREE.Object3D();
    const positions: number[] = [];
    let pulseCount = 0;
    
    particles.forEach((p, i) => {
      p.x += p.velocity.x;
      p.y += p.velocity.y;
      p.z += p.velocity.z;

      if (Math.abs(p.x) > 5) p.velocity.x *= -1;
      if (Math.abs(p.y) > 5) p.velocity.y *= -1;
      if (Math.abs(p.z) > 3) p.velocity.z *= -1;

      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(0.04 + Math.sin(t * 2 + i) * 0.02);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      particles.forEach((p2, j) => {
        if (i < j) {
          const v1 = new THREE.Vector3(p.x, p.y, p.z);
          const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
          const dist = v1.distanceTo(v2);
          
          if (dist < 2.5) {
            positions.push(p.x, p.y, p.z, p2.x, p2.y, p2.z);
            
            // Add a traveling pulse
            const pulsePos = (t * 0.5 + i * 0.1) % 1.0;
            const currentPulsePos = new THREE.Vector3().lerpVectors(v1, v2, pulsePos);
            pulseDummy.position.copy(currentPulsePos);
            pulseDummy.scale.setScalar(0.02 * (1.0 - pulsePos)); // Fade out as it reaches the end
            pulseDummy.updateMatrix();
            if (pulseCount < 100) {
              pulseMeshRef.current.setMatrixAt(pulseCount, pulseDummy.matrix);
              pulseCount++;
            }
          }
        }
      });
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    pulseMeshRef.current.instanceMatrix.needsUpdate = true;
    lineRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.4} />
      </instancedMesh>
      <instancedMesh ref={pulseMeshRef} args={[undefined, undefined, 100]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </instancedMesh>
      <lineSegments ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#00f2ff" transparent opacity={0.1} />
      </lineSegments>
    </>
  );
}

export default function NeuralFluidIntelligence() {
  const [pulse, setPulse] = useState(0);

  // Listen for typing globally
  useEffect(() => {
    const handleKeyDown = () => {
      setPulse((prev) => prev + 0.1);
      setTimeout(() => setPulse((prev) => Math.max(0, prev - 0.1)), 500);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div 
      className="fixed inset-0 -z-10 bg-black overflow-hidden"
      onClick={() => setPulse((prev) => prev + 0.5)}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <fog attach="fog" args={["#000", 5, 15]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1 + pulse} color="#00f2ff" />
        <FluidSurface />
        <NeuralGrid />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
      
      {/* Interaction Ripple Layer (CSS) */}
      <AnimatePresence>
        {pulse > 0.4 && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/30 rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

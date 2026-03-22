"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// GLSL Shader for Liquid Intelligence (SSS + Iridescence + Noise)
const LiquidIntelligenceShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uIntensity: { value: 0.5 },
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vNoise;

    // Simple 3D Noise (Simplex-like)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Procedural Deformation
      float noise = snoise(position * 0.5 + uTime * 0.2);
      vNoise = noise;
      vec3 newPosition = position + normal * noise * 0.4;
      vPosition = newPosition;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vNoise;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(-vPosition); // Simplified view dir
      
      // Fresnel for glow and iridescence
      float fresnel = pow(1.0 - dot(normal, viewDir), 3.0);
      
      // Subsurface Scattering Approximation
      float sss = pow(abs(vNoise), 2.0) * 0.5;
      
      // Iridescent colors
      vec3 color1 = vec3(0.0, 0.9, 1.0); // Cyan
      vec3 color2 = vec3(0.4, 0.0, 1.0); // Violet
      vec3 color3 = vec3(1.0, 1.0, 1.0); // White highlight
      
      vec3 baseColor = mix(color1, color2, fresnel + sss);
      baseColor = mix(baseColor, color3, pow(fresnel, 5.0));
      
      // Volumetric feel: deeper center
      float depth = 0.2 + 0.8 * (1.0 - fresnel);
      
      gl_FragColor = vec4(baseColor * depth, 0.4 + fresnel * 0.4);
    }
  `,
};

function LiquidBlob({ position, scale, speed }: { position: [number, number, number], scale: number, speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uIntensity: { value: 0.5 },
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    uniforms.uTime.value = t;
    meshRef.current.rotation.x = t * 0.1;
    meshRef.current.rotation.y = t * 0.15;
    
    // Subtle attraction to mouse
    const mouse = new THREE.Vector3(state.pointer.x * 2, state.pointer.y * 2, 0);
    meshRef.current.position.lerp(new THREE.Vector3(...position).add(mouse.multiplyScalar(0.2)), 0.05);
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 32]} />
      <shaderMaterial 
        transparent 
        uniforms={uniforms}
        vertexShader={LiquidIntelligenceShader.vertexShader}
        fragmentShader={LiquidIntelligenceShader.fragmentShader}
      />
    </mesh>
  );
}

function CinematicCamera() {
  const { camera } = useThree();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Slow cinematic drift
    camera.position.x = Math.sin(t * 0.1) * 0.5;
    camera.position.y = Math.cos(t * 0.1) * 0.5;
    camera.lookAt(0, 0, 0);
    
    // Focus breathing (FOV pulse)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 45 + Math.sin(t * 0.2) * 2;
      camera.updateProjectionMatrix();
    }
  });
  
  return null;
}

function EnergyCore() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 1.0 + Math.sin(t * 0.5) * 0.2;
    meshRef.current.scale.setScalar(pulse);
    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
      meshRef.current.material.opacity = 0.1 + Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.5}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#00f2ff" transparent opacity={0.1} side={THREE.BackSide} />
    </mesh>
  );
}

export default function LiquidIntelligenceBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0a0a] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <CinematicCamera />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#7000ff" />
        
        {/* Procedural Blobs */}
        <LiquidBlob position={[0, 0, 0]} scale={2} speed={0.5} />
        <LiquidBlob position={[-3, 2, -2]} scale={1} speed={0.7} />
        <LiquidBlob position={[3, -2, -1]} scale={1.2} speed={0.6} />
        
        <EnergyCore />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-none" />
    </div>
  );
}

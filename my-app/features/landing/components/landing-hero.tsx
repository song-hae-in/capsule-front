import { Canvas, useFrame } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Mesh } from 'three';

import textureUrl from '../assets/landing-texture.png';
import depthUrl from '../assets/landing-depth.png';

const DEFAULT_TEXTURE = textureUrl;
const DEFAULT_DEPTH = depthUrl;
const PLANE_WIDTH = 300;
const PLANE_HEIGHT = 300;
const CAPSULE_VIOLET = new THREE.Vector3(0.72, 0.38, 1.0);

function LandingHeroMesh({
  textureSrc,
  depthSrc,
  scaleFactor = 0.32,
}: {
  textureSrc: string;
  depthSrc: string;
  scaleFactor?: number;
}) {
  const [rawMap, depthMap] = useTexture([textureSrc, depthSrc]);
  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (rawMap && depthMap) {
      rawMap.colorSpace = THREE.SRGBColorSpace;
      rawMap.premultiplyAlpha = false;
      depthMap.colorSpace = THREE.NoColorSpace;
      setVisible(true);
    }
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform sampler2D uDepthMap;
      uniform vec2 uPointer;
      uniform float uProgress;
      uniform vec3 uAccent;
      varying vec2 vUv;

      void main() {
        float depth = texture2D(uDepthMap, vUv).r;
        vec2 offset = depth * uPointer * 0.004; // 흔들림 정도
        vec4 tex = texture2D(uTexture, vUv + offset); 

        float depthMask = smoothstep(0.03, 0.1, depth);
        float alpha = tex.a * depthMask;

        if (alpha < 0.01) discard;

        vec2 grid = mod(vUv * 82.0, 1.5) - 1.0;  
        float gridDist = length(grid); 
        float dot = smoothstep(0.5, 0.49, gridDist); 
        float flow = 1.0 - smoothstep(0.0, 0.02, abs(depth - uProgress));
        vec3 mask = uAccent * dot * flow * 2.2;

        vec3 color = tex.rgb * 0.78 + mask * alpha;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: rawMap },
        uDepthMap: { value: depthMap },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uProgress: { value: 0 },
        uAccent: { value: CAPSULE_VIOLET.clone() },
      },
      transparent: true,
      depthWrite: false,
    });

    return {      material: shaderMaterial,
      uniforms: shaderMaterial.uniforms,
    };
  }, [rawMap, depthMap]);

  const [width, height] = useAspect(PLANE_WIDTH, PLANE_HEIGHT);

  useFrame(({ clock, pointer }) => {
    uniforms.uProgress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    uniforms.uPointer.value.lerp(pointer, 0.06);
    if (meshRef.current && material) {
      material.opacity = THREE.MathUtils.lerp(material.opacity, visible ? 1 : 0, 0.07);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.05, 0]}
      scale={[width * scaleFactor, height * scaleFactor, 1]}
      material={material}
    >
      <planeGeometry />
    </mesh>
  );
}

type LandingHeroProps = {
  title?: string;
  subtitle?: string;
  textureSrc?: string;
  depthSrc?: string;
  scaleFactor?: number;
  className?: string;
};

export default function LandingHero({
  title = 'Send Memories',
  subtitle = 'Seal your message on the blockchain and open it at the moment you choose.',
  textureSrc = DEFAULT_TEXTURE,
  depthSrc = DEFAULT_DEPTH,
  scaleFactor = 0.32,
  className = '',
}: LandingHeroProps) {
  return (
    <section className={`landing-hero relative h-svh w-full overflow-hidden bg-background ${className}`}>
      <div className="pointer-events-none absolute inset-0 z-50">
        <div className="absolute top-0 right-0 left-0 h-24 bg-gradient-to-b from-background/80 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center px-6 sm:px-10">
        <div className="max-w-2xl -translate-y-2 text-center sm:max-w-3xl">
          <h1 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-foreground md:text-4xl xl:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-xl px-2 font-sans text-sm leading-relaxed text-muted-foreground md:mx-auto md:max-w-2xl md:text-base">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[12%] z-[60] flex justify-center px-6 sm:px-10 md:bottom-[14%]">
        <div className="pointer-events-auto flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl sm:w-auto"
          >
            Start Your Capsule
          </button>
          <button
            type="button"
            className="w-full rounded-full border border-border px-6 py-3 text-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground sm:w-auto"
          >
            Learn more
          </button>
        </div>
      </div>

      <Canvas
        className="absolute inset-0 h-full w-full"
        camera={{ position: [0, 0, 1], fov: 75, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <LandingHeroMesh
            textureSrc={textureSrc}
            depthSrc={depthSrc}
            scaleFactor={scaleFactor}
          />
        </Suspense>
      </Canvas>
    </section>
  );
}

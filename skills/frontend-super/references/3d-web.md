# 3D Web Reference

Interactive 3D on the web — Three.js, React Three Fiber, Spline, and WebGPU.

---

## Tool Selection

| Scenario | Tool | Why |
|----------|------|-----|
| Complex custom 3D with full control | **Three.js** | 270x more downloads than alternatives. Full WebGPU support. |
| 3D in a React app | **React Three Fiber (R3F)** | Declarative JSX for Three.js. First-class React integration. |
| Designer creating 3D, no code | **Spline** | First animation in < 1 hour. Free plan. Native Webflow integration. |
| 3D scene timeline animation | **Theatre.js + Three.js** | After Effects-level timeline control in browser. |

---

## Three.js Essentials

### Basic Scene Setup

```typescript
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
document.body.appendChild(renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

### WebGPU (Production-Ready since Three.js r171)

```typescript
import * as THREE from 'three';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

const renderer = new WebGPURenderer({ antialias: true });
await renderer.init(); // WebGPU requires async init

// Benefits over WebGL:
// - Faster frame rates
// - Improved lighting accuracy
// - Reduced GPU load
// - Compute shaders for particles and physics
```

Safari 26+ supports WebGPU — now safe to ship to all users.

---

## React Three Fiber (R3F)

### Basic R3F Scene

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4F46E5" />
      </mesh>
      <OrbitControls enableDamping />
      <Environment preset="city" />
    </Canvas>
  );
}
```

### Scroll-Triggered 3D Animation

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';

function AnimatedModel() {
  const scroll = useScroll();
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = scroll.offset * Math.PI * 2;
      meshRef.current.position.y = scroll.offset * -5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshStandardMaterial color="#10B981" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}
```

### Loading 3D Models

```tsx
import { useGLTF } from '@react-three/drei';

function ProductModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={0.5} />;
}

// Preload for instant display
useGLTF.preload('/models/product.glb');
```

---

## Performance Optimization

### Critical Techniques

| Technique | Impact | How |
|-----------|--------|-----|
| **Draco Compression** | 90-95% geometry reduction | `npx gltf-pipeline -i model.glb -o model-draco.glb -d` |
| **KTX2 Textures** | ~10x GPU memory reduction | Use Basis Universal compression |
| **LOD (Level of Detail)** | 30-40% FPS improvement | Swap models based on camera distance |
| **Instanced Meshes** | Massive gains for repeated geometry | `<instancedMesh count={1000}>` |
| **Pixel Ratio Cap** | Prevents GPU overload | `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` |

### R3F Performance Patterns

```tsx
// Instanced rendering for many identical objects
function Particles({ count = 1000 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current!.instanceMatrix.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ff6b6b" />
    </instancedMesh>
  );
}
```

---

## Spline Integration

### React Component

```tsx
import Spline from '@splinetool/react-spline';

function Hero3D() {
  return (
    <Spline
      scene="https://prod.spline.design/xxx/scene.splinecode"
      style={{ width: '100%', height: '500px' }}
    />
  );
}
```

### When to Use Spline vs Three.js

| Spline | Three.js / R3F |
|--------|----------------|
| Quick prototypes | Production custom 3D |
| Designer-driven 3D | Developer-driven 3D |
| Simple interactions | Complex physics/particles |
| No-code team members | Full programmatic control |

---

## Loading Strategy

3D assets are heavy. Always lazy-load:

```tsx
import { Suspense, lazy } from 'react';

const Scene3D = lazy(() => import('./Scene3D'));

function Page() {
  return (
    <div>
      <HeroText />
      <Suspense fallback={<div className="h-[500px] bg-surface animate-pulse" />}>
        <Scene3D />
      </Suspense>
    </div>
  );
}
```

### Performance Budget for 3D

| Asset | Budget |
|-------|--------|
| Compressed model (.glb + Draco) | < 500KB |
| Textures (KTX2) | < 1MB total |
| Total 3D scene initial load | < 2MB |
| Target FPS | 60fps (30fps minimum on mobile) |
| Mobile: consider | 2D fallback or simpler scene |

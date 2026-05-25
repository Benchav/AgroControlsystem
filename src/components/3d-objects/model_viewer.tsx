import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

type Props = {
  modelPath: string;
};

function Model({ modelPath }: Props) {
  const gltf = useGLTF(modelPath);

  return <primitive object={gltf.scene} scale={3} />;
}

export function ModelViewer({ modelPath }: Props) {
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={1} />

        <directionalLight position={[5, 5, 5]} intensity={2} />

        <Suspense fallback={null}>
          <Model modelPath={modelPath} />

          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
        />
      </Canvas>
    </div>
  );
}
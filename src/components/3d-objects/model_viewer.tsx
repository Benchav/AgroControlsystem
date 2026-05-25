import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { useMemo } from "react";
import { SkeletonUtils } from "three-stdlib";

type Props = {
  modelPath: string;
  interactive?: boolean;
};

function Model({ modelPath }: Props) {
  const gltf = useGLTF(modelPath);

  const scene = useMemo(() => {
    return SkeletonUtils.clone(gltf.scene);
  }, [gltf.scene]);

  return <primitive object={scene} scale={3} />;
}

export function ModelViewer({ modelPath, interactive = false }: Props) {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={1} />

        <directionalLight position={[5, 5, 5]} intensity={2} />

        <Suspense fallback={null}>
          <Model modelPath={modelPath} />

          <Environment preset="city" />
        </Suspense>

        {interactive && <OrbitControls enablePan enableZoom enableRotate />}
      </Canvas>
    </div>
  );
}

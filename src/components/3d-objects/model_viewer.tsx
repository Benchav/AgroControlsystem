import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { useMemo } from "react";
import { SkeletonUtils } from "three-stdlib";
import { Models3dItem } from "../../entities/3d_object_model";

type Props = {
  modelPath: string;
  interactive?: boolean;
  model3d: Models3dItem;
};

function Model({ modelPath }: { modelPath: string }) {
  const gltf = useGLTF(modelPath);

  const scene = useMemo(() => {
    return SkeletonUtils.clone(gltf.scene);
  }, [gltf.scene]);

  return <primitive object={scene} scale={3} />;
}

export function ModelViewer({ modelPath, interactive = false, model3d }: Props) {
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
      {/* info aditional */}
      {interactive && model3d && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-sm bg-black/80 backdrop-blur-md text-white p-4 rounded-xl border border-white/10 shadow-2xl pointer-events-auto transition-all">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-emerald-400">{model3d.title}</h3>
              <p className="text-xs text-slate-400">Diseñado por: {model3d.author}</p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-sm font-semibold px-2 py-1 rounded">
              ${model3d.currentPrice}
            </span>
          </div>

          <hr className="border-white/10 my-2" />

          <div className="space-y-1.5 text-xs text-slate-300">
            <p><strong>Nutrición:</strong> {model3d.nutritionalInfo}</p>
            <p><strong>Período de Crecimiento:</strong> {model3d.growthPeriod}</p>
            <p><strong>Requerimiento Hídrico:</strong> {model3d.waterRequirements}</p>

            {model3d.recommendedFertilizers && model3d.recommendedFertilizers !== "No aplica" && (
              <p><strong>Fertilizante:</strong> {model3d.recommendedFertilizers}</p>
            )}

            {model3d.commonDiseases && model3d.commonDiseases !== "No aplica" && (
              <p className="text-red-300"><strong>Enfermedades comunes:</strong> {model3d.commonDiseases}</p>
            )}

            {model3d.parcels && model3d.parcels.length > 0 && (
              <p><strong>Parcelas:</strong> {model3d.parcels.join(', ')}</p>
            )}

            <p className="pt-1 text-slate-400 italic">
              <strong>Prod. Estimada:</strong> {model3d.estimatedProduction}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

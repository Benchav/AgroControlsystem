import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

// 1. Subcomponente que carga el archivo .glb y lo hace girar
function Model() {
  // Busca el archivo agro_model.glb dentro de tu carpeta 'public'
  const { scene } = useGLTF("/tractor3D.glb");
  const modelRef = useRef<THREE.Group>(null);

  // Hace que el objeto gire solo de forma infinita (ajusta 0.005 para cambiar la velocidad)
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.004;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={3} // Si tu objeto se ve muy chico o muy grande, cambia este número
    />
  );
}

// 2. Componente principal exportado
export function SplineBackdrop() {
  const [shouldLoad, setShouldLoad] = useState(false);

  // Mantenemos tu excelente lógica original para no trabar la web al cargar
  useEffect(() => {
    let mounted = true;

    const startLoading = () => {
      if (mounted) setShouldLoad(true);
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(startLoading, { timeout: 1200 });
    } else {
      setTimeout(startLoading, 0);
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Si aún no se cumple el tiempo de inactividad, no renderiza nada para cuidar el rendimiento
  if (!shouldLoad) return null;

  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true }}
      >
        {/* Iluminación general del entorno 3D */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[-5, -5, -5]} intensity={1} />

        {/* Carga el modelo de forma segura */}
        <Suspense fallback={null}>
          <group position={[2.2, 0, 0]}>
            <Center>
              <Model />
            </Center>
          </group>
        </Suspense>

        {/* Permite mover el objeto con el mouse (Rotación libre) */}
        <OrbitControls
          enableZoom={false} // Falso para que no interfiera si el usuario hace scroll en la web
          enablePan={false} // Falso para que el usuario no desplace el objeto fuera de la pantalla
          dampingFactor={0.05} // Le da un efecto suave e inercial al soltar el click
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
}

// Pre-carga el modelo en segundo plano
useGLTF.preload("/tractor3D.glb");

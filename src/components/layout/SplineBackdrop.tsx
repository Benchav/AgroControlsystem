import { useEffect } from 'react';

let splineLoadPromise: Promise<unknown> | null = null;

export function SplineBackdrop() {
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      splineLoadPromise ??= import('../../../spline_scene.js');
      await splineLoadPromise;
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(load, { timeout: 1200 });
    } else {
      setTimeout(load, 0);
    }

    return () => {
      mounted = false;
    };
  }, []);

  return <canvas id="canvas3d" className="absolute inset-0 h-full w-full" />;
}

import { ModelGrid } from '../components/3d-objects/model_grid';
import { useModels3d } from '../hooks/useModels3d';

export function Models3dPage() {
  const { models, isLoading} = useModels3d();
  
  return (
    <div className="space-y-6">
      <ModelGrid models={models} />
    </div>
  );
}
import { ModelGrid } from '../components/3d-objects/model_grid';
import { models3d } from '../config/models3d';

export function Models3dPage() {
  return (
    <div className="space-y-6">
      <ModelGrid models={models3d} />
    </div>
  );
}
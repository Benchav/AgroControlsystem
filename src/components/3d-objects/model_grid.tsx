import { Models3dItem } from "../../entities/3d_object_model";
import { ModelCard } from "./model_card";

type Props = {
  models: Models3dItem[];
};

export function ModelGrid({ models }: Props) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {models.map((model) => (
        <ModelCard
          key={model.title}
          model3d={model}
        />
      ))}
    </div>
  );
}
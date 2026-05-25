import { ModelViewer } from "./model_viewer";

type Props = {
  title: string;
  author: string;
  modelPath: string;
};

export function ModelCard({
  title,
  author,
  modelPath,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
      <ModelViewer modelPath={modelPath} />

      <div className="mt-4">
        <h3 className="text-white font-semibold">
          {title}
        </h3>

        <p className="text-sm text-slate-400">
          {author}
        </p>
      </div>
    </div>
  );
}
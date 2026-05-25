import { useState } from "react";

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
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* CARD */}
      <div className="rounded-2xl border border-white/10 bg-emerald-400/10 p-4">
        
        {/* PREVIEW NO INTERACTIVA */}
        <div className="pointer-events-none">
          <ModelViewer
            modelPath={modelPath}
            interactive={false}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">
              {title}
            </h3>

            <p className="text-sm text-slate-400">
              {author}
            </p>
          </div>

          {/* BOTON */}
          <button
            onClick={() => setVisible(true)}
            className="
              rounded-xl
              bg-emerald-400/80
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-emerald-400
            "
          >
            Ver modelo
          </button>
        </div>
      </div>

      {/* MODAL */}
      {visible && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/80
            backdrop-blur-sm
            p-6
          "
        >
          {/* CONTENEDOR */}
          <div
            className="
              relative
              h-[90vh]
              w-full
              max-w-7xl
              overflow-hidden
              rounded-2xl
              bg-[#111]
              border
              border-white/10
            "
          >
            {/* BOTON CERRAR */}
            <button
              onClick={() => setVisible(false)}
              className="
                absolute
                right-4
                top-4
                z-50
                rounded-full
                bg-white/10
                px-3
                py-2
                text-sm
                text-white
                hover:bg-white/20
              "
            >
              ✕
            </button>

            {/* VIEWER INTERACTIVO */}
            <ModelViewer
              modelPath={modelPath}
              interactive={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
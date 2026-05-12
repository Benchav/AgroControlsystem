import { PageSection } from '../components/layout/PageSection';
import { SketchfabModelGrid } from '../components/models/SketchfabModelGrid';
import { models3d } from '../config/models3d';

export function Models3dPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Visualización 3D de plantas y terrenos vía Sketchfab</p>
      <SketchfabModelGrid models={models3d} />

      <PageSection title="Catálogo de modelos" subtitle="Gestión de activos 3D">
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full border-collapse text-left text-sm text-slate-300">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Autor</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Plantas Felizes II', 'Plantas', 'Robótica Paraná', 'Activo'],
                ['Cantera Cd. Valles', 'Terreno industrial', 'Juan Aguirre', 'Activo'],
                ['Terreno Guanhuma', 'Terreno agrícola', 'Comunidad', 'Activo'],
              ].map(([name, category, author, state]) => (
                <tr key={name} className="border-t border-white/6">
                  <td className="px-4 py-3">{name}</td>
                  <td className="px-4 py-3">{category}</td>
                  <td className="px-4 py-3">{author}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">{state}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>
    </div>
  );
}

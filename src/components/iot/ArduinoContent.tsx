import React from 'react';
import { PageSection } from '../../components/layout/PageSection';
import { Arduino } from '../../entities/arduino_model';

type Props = {
  arduinos: Arduino[];
  toggleArduinoStatus: (id: string) => void;
  handleDeleteArduino: (id: string) => void;
  handleAddArduino: (e: React.FormEvent) => void;
  formError: string;
  newArdId: string;
  setNewArdId: (v: string) => void;
  newArdName: string;
  setNewArdName: (v: string) => void;
  newArdLoc: string;
  setNewArdLoc: (v: string) => void;
  newArdBaud: number;
  setNewArdBaud: (v: number) => void;
  newArdFreq: number;
  setNewArdFreq: (v: number) => void;
  newArdStatus: 'active' | 'inactive';
  setNewArdStatus: (v: 'active' | 'inactive') => void;
  newArdDesc: string;
  setNewArdDesc: (v: string) => void;
};

export const ArduinoContent: React.FC<Props> = ({
  arduinos,
  toggleArduinoStatus,
  handleDeleteArduino,
  handleAddArduino,
  formError,
  newArdId,
  setNewArdId,
  newArdName,
  setNewArdName,
  newArdLoc,
  setNewArdLoc,
  newArdBaud,
  setNewArdBaud,
  newArdFreq,
  setNewArdFreq,
  newArdStatus,
  setNewArdStatus,
  newArdDesc,
  setNewArdDesc,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PageSection title="Placas de Desarrollo Conectadas" subtitle="Control de hardware IoT y telemetría de campo">
            <div className="space-y-4">
              {arduinos.map((arduino) => {
                const isActive = arduino.status === 'active';
                return (
                  <div key={arduino.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 flex flex-col justify-between md:flex-row md:items-center gap-4 hover:border-white/12 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                        <span className="font-mono text-xs font-bold text-slate-500">{arduino.id}</span>
                        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{isActive ? 'Activo' : 'Inactivo'}</span>
                      </div>
                      <h3 className="text-md font-bold text-white">{arduino.name}</h3>
                      <p className="text-xs text-slate-400">{arduino.description}</p>
                      <div className="flex gap-4 pt-1 text-[10px] text-slate-500">
                        <span>📍 {arduino.location}</span>
                        <span>⚡ {arduino.baudRate} baudios</span>
                        <span>🕒 {arduino.frequency}s de lectura</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <button onClick={() => toggleArduinoStatus(arduino.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${isActive ? 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'}`}>{isActive ? '🔴 Desactivar' : '🟢 Activar'}</button>
                      <button onClick={() => handleDeleteArduino(arduino.id)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition-all">Eliminar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </PageSection>
        </div>

        <div className="space-y-4">
          <PageSection title="Registrar Placa Arduino" subtitle="Vincular nuevo nodo al ecosistema">
            <form onSubmit={handleAddArduino} className="space-y-4">
              {formError && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{formError}</div>}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">ID del Dispositivo *</label>
                <input type="text" required placeholder="Ej. ARD-UNO-04" value={newArdId} onChange={(e) => setNewArdId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Nombre de la Placa *</label>
                <input type="text" required placeholder="Ej. Arduino de Riego Central" value={newArdName} onChange={(e) => setNewArdName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Ubicación</label>
                  <select value={newArdLoc} onChange={(e) => setNewArdLoc(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none">
                    <option value="Parcela Norte" className="bg-slate-900 text-white">Parcela Norte</option>
                    <option value="Parcela Sur" className="bg-slate-900 text-white">Parcela Sur</option>
                    <option value="Sector 2A" className="bg-slate-900 text-white">Sector 2A</option>
                    <option value="Zona Crítica" className="bg-slate-900 text-white">Zona Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Baudios (Serial)</label>
                  <select value={newArdBaud} onChange={(e) => setNewArdBaud(Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none">
                    <option value={9600} className="bg-slate-900 text-white">9600 bps</option>
                    <option value={19200} className="bg-slate-900 text-white">19200 bps</option>
                    <option value={115200} className="bg-slate-900 text-white">115200 bps</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Frecuencia (seg.)</label>
                  <input type="number" min={1} max={120} value={newArdFreq} onChange={(e) => setNewArdFreq(Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Estado Inicial</label>
                  <select value={newArdStatus} onChange={(e) => setNewArdStatus(e.target.value as 'active' | 'inactive')} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none">
                    <option value="active" className="bg-slate-900 text-white">Activo</option>
                    <option value="inactive" className="bg-slate-900 text-white">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Descripción corta</label>
                <textarea placeholder="Detalles sobre su propósito u orientación de sensores..." rows={3} value={newArdDesc} onChange={(e) => setNewArdDesc(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none" />
              </div>

              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-black text-white transition-all duration-200 hover:brightness-110 active:scale-95 shadow-md shadow-emerald-500/20">➕ Registrar Arduino</button>
            </form>
          </PageSection>
        </div>
      </div>

      <PageSection title="Prototipo Físico IoT: Aula 19 — Plantas Felizes II" subtitle="Modelo interactivo 3D del microcontrolador conectado al cultivo">
        <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-white/8 bg-[#1e1e2f] shadow-lg">
          <iframe src="https://sketchfab.com/models/72e2f71f57e94935b04325bb7775bfc7/embed?ui_theme=dark&ui_hint=0&autostart=0" title="Aula 19 - Plantas Felizes II" allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen className="h-full w-full border-0" />
        </div>
        <div className="mt-3 text-xs text-slate-400">💡 <strong>Inspección Virtual 3D:</strong> Explora esta maqueta interactiva creada por <strong>Robótica Paraná</strong> que muestra exactamente cómo se conecta una placa Arduino Uno R3 en un protoboard para medir la humedad de suelo de una planta en tiempo real. Arrastra para rotar en 360 grados y haz zoom para ver el cableado físico.</div>
      </PageSection>
    </div>
  );
};

export default ArduinoContent;

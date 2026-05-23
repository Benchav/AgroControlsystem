import { useState, useEffect } from "react";
import { PageSection } from "../components/layout/PageSection";
import type { SystemSettings, UserProfile } from "../types/app";

const defaultProfile: UserProfile = {
  name: "Juan Rodríguez",
  email: "juan@agrocontrol.io",
  org: "Finca La Esperanza",
};

const defaultSettings: SystemSettings = {
  humidityThreshold: 40,
  temperatureThreshold: 30,
  phThreshold: 6.0,
};

export function SettingsPage() {
  // Cargar perfil con lazy initialization
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("ac_profile");
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  // Cargar configuración con lazy initialization
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem("ac_settings");
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [showToast, setShowToast] = useState(false);

  // Persistir la configuración en tiempo real cada vez que cambien los deslizadores
  useEffect(() => {
    localStorage.setItem("ac_settings", JSON.stringify(settings));
  }, [settings]);

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const updateSettings = (field: keyof SystemSettings, value: number) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSaveProfile = () => {
    localStorage.setItem("ac_profile", JSON.stringify(profile));
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2 relative">
      <PageSection title="Perfil de usuario" subtitle="Datos básicos y finca">
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase">Nombre completo</div>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200"
              value={profile.name}
              onChange={(event) => updateProfile("name", event.target.value)}
              placeholder="Juan Rodríguez"
            />
          </div>
          <div>
            <div className="mb-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase">
              Correo electrónico
            </div>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200"
              value={profile.email}
              onChange={(event) => updateProfile("email", event.target.value)}
              placeholder="juan@agrocontrol.io"
            />
          </div>
          <div>
            <div className="mb-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase">
              Finca / Organización
            </div>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200"
              value={profile.org}
              onChange={(event) => updateProfile("org", event.target.value)}
              placeholder="Finca La Esperanza"
            />
          </div>
          <button
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 shadow-md shadow-emerald-500/20"
            type="button"
            onClick={handleSaveProfile}
          >
            Guardar perfil
          </button>
        </div>
      </PageSection>

      <PageSection
        title="Integraciones y sistema"
        subtitle="Monitoreo de conexiones y APIs"
      >
        <div className="space-y-3 text-sm text-slate-300">
          {[
            ["Google Gemini 2.5 Flash", "Conectado", "Diagnóstico por visión de plantas"],
            ["Groq · Llama 3", "Conectado", "Asistente virtual agronómico"],
            ["Arduino IoT Cloud", "Conectado", "Lectura directa de telemetría de campo"],
            ["Sketchfab API", "Pendiente", "Carga de gemelos digitales y modelos 3D"],
          ].map(([name, state, desc]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-2xl border border-white/6 bg-black/20 p-4 transition-all duration-200 hover:border-white/10"
            >
              <div>
                <div className="font-semibold text-white">{name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {desc}
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${state === "Conectado" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}
              >
                {state}
              </span>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        title="Umbrales de alerta"
        subtitle="Sincronizados con sensores IoT en tiempo real"
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/6 bg-black/10 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                💧 Humedad mínima crítica
              </span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">
                {settings.humidityThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              className="w-full accent-emerald-500 bg-white/10 rounded-lg appearance-none h-2 cursor-pointer focus:outline-none"
              value={settings.humidityThreshold}
              onChange={(event) =>
                updateSettings("humidityThreshold", Number(event.target.value))
              }
            />
            <p className="text-[11px] text-slate-500">
              Los sensores que bajen de este valor reportarán estado <strong>Crítico</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-white/6 bg-black/10 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                🌡️ Temperatura máxima suelo
              </span>
              <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-xs">
                {settings.temperatureThreshold}°C
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              className="w-full accent-amber-500 bg-white/10 rounded-lg appearance-none h-2 cursor-pointer focus:outline-none"
              value={settings.temperatureThreshold}
              onChange={(event) =>
                updateSettings(
                  "temperatureThreshold",
                  Number(event.target.value),
                )
              }
            />
            <p className="text-[11px] text-slate-500">
              Temperaturas superiores a este nivel generarán alertas de <strong>Estrés Térmico</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-white/6 bg-black/10 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                ⚗️ pH mínimo del suelo
              </span>
              <span className="font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded text-xs">
                {settings.phThreshold.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="10"
              step="0.1"
              className="w-full accent-violet-500 bg-white/10 rounded-lg appearance-none h-2 cursor-pointer focus:outline-none"
              value={settings.phThreshold}
              onChange={(event) =>
                updateSettings("phThreshold", Number(event.target.value))
              }
            />
            <p className="text-[11px] text-slate-500">
              Controla el nivel de acidez crítico para la absorción de nutrientes.
            </p>
          </div>
        </div>
      </PageSection>

      {/* Floating Success Toast */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900/90 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 animate-pulse">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <i className="fas fa-check-circle" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Perfil Actualizado</div>
            <div className="text-xs text-slate-400">
              Los cambios se persistieron en localStorage.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

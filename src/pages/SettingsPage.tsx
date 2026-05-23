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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Encabezado Principal */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-white/5 pb-5">
        <div>
          <p className="text-sm text-emerald-400 font-semibold tracking-wider uppercase">Configuración de Plataforma</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <i className="fas fa-sliders-h text-emerald-400"></i> Panel de Control y Ajustes
          </h1>
        </div>
        <div className="text-xs text-slate-500 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Consola Sincronizada</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* COLUMNA IZQUIERDA: Perfil y Datos de Finca (5 Columnas) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative overflow-hidden rounded-[30px] border border-white/8 bg-slate-950/40 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/12">
            {/* Banner de fondo decorativo */}
            <div className="h-28 bg-gradient-to-r from-emerald-600/30 to-teal-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent)]"></div>
            </div>

            {/* Avatar circular con botón de editar */}
            <div className="px-6 pb-6 relative">
              <div className="flex justify-between items-end -mt-10 mb-4">
                <div className="relative group">
                  <div className="h-20 w-20 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-xl group-hover:scale-105 transition-all duration-300">
                    <img 
                      src="https://media.licdn.com/dms/image/v2/D4D03AQGzNupeLUFAyw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1730153946491?e=2147483647&v=beta&t=IlTbPxy6bAEzcbG5Sz5Fi2AZEPHLeNh9o_QzsPKdP0M" 
                      alt="Avatar" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-emerald-500 hover:bg-emerald-600 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white transition-all shadow-md">
                    <i className="fas fa-camera"></i>
                  </button>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Administrador
                  </span>
                  <div className="text-xs text-slate-500 mt-1">ID: AG-9241-ES</div>
                </div>
              </div>

              {/* Título de Sección */}
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fas fa-user-circle text-emerald-400 text-base"></i> Perfil de Operador
                </h2>
                <p className="text-xs text-slate-400">Datos básicos de la cuenta y organización</p>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                    <i className="fas fa-user text-[10px] text-slate-500"></i> Nombre completo
                  </label>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200"
                    value={profile.name}
                    onChange={(event) => updateProfile("name", event.target.value)}
                    placeholder="Juan Rodríguez"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                    <i className="fas fa-envelope text-[10px] text-slate-500"></i> Correo electrónico
                  </label>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200"
                    value={profile.email}
                    onChange={(event) => updateProfile("email", event.target.value)}
                    placeholder="juan@agrocontrol.io"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                    <i className="fas fa-building text-[10px] text-slate-500"></i> Finca / Organización
                  </label>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200"
                    value={profile.org}
                    onChange={(event) => updateProfile("org", event.target.value)}
                    placeholder="Finca La Esperanza"
                  />
                </div>

                <div className="pt-2">
                  <button
                    className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] py-3 text-sm font-bold text-white transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
                    type="button"
                    onClick={handleSaveProfile}
                  >
                    <i className="fas fa-save"></i> Guardar Perfil de Usuario
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Parámetros del Sistema e Integraciones (7 Columnas) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECCIÓN 1: UMBRALES DE ALERTA */}
          <div className="rounded-[30px] border border-white/8 bg-slate-950/40 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:border-white/12">
            <div className="mb-5 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fas fa-bell text-amber-400 text-base"></i> Parámetros de Alerta Crítica
                </h2>
                <p className="text-xs text-slate-400">Umbrales operativos de los sensores en el campo</p>
              </div>
              <span className="rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                Reactivo IoT
              </span>
            </div>

            <div className="space-y-4">
              {/* Humedad */}
              <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs">
                      <i className="fas fa-tint"></i>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200">Humedad mínima crítica</div>
                      <div className="text-[10px] text-slate-500">Mínimo para reportar sensores OK</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl text-xs border border-emerald-500/15">
                    {settings.humidityThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  className="w-full accent-emerald-500 bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer focus:outline-none"
                  value={settings.humidityThreshold}
                  onChange={(event) =>
                    updateSettings("humidityThreshold", Number(event.target.value))
                  }
                />
              </div>

              {/* Temperatura */}
              <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs">
                      <i className="fas fa-thermometer-half"></i>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200">Temperatura máxima suelo</div>
                      <div className="text-[10px] text-slate-500">Estrés térmico superior a este límite</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl text-xs border border-amber-500/15">
                    {settings.temperatureThreshold}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  className="w-full accent-amber-500 bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer focus:outline-none"
                  value={settings.temperatureThreshold}
                  onChange={(event) =>
                    updateSettings(
                      "temperatureThreshold",
                      Number(event.target.value),
                    )
                  }
                />
              </div>

              {/* pH */}
              <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 text-xs">
                      <i className="fas fa-vial"></i>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200">pH mínimo del suelo</div>
                      <div className="text-[10px] text-slate-500">Acidez crítica para absorción de nutrientes</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-xl text-xs border border-violet-500/15">
                    {settings.phThreshold.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.1"
                  className="w-full accent-violet-500 bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer focus:outline-none"
                  value={settings.phThreshold}
                  onChange={(event) =>
                    updateSettings("phThreshold", Number(event.target.value))
                  }
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: INTEGRACIONES Y SISTEMA */}
          <div className="rounded-[30px] border border-white/8 bg-slate-950/40 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:border-white/12">
            <div className="mb-5 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fas fa-project-diagram text-sky-400 text-base"></i> Servicios e Integraciones API
                </h2>
                <p className="text-xs text-slate-400">Estado de conexiones a motores de Inteligencia Artificial y Hardware</p>
              </div>
              <span className="rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                API Status
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { 
                  name: "Google Gemini 2.5", 
                  state: "Conectado", 
                  desc: "Visión & Diagnóstico", 
                  icon: "fa-sparkles", 
                  color: "emerald" 
                },
                { 
                  name: "Groq · Llama 3", 
                  state: "Conectado", 
                  desc: "Asistente Virtual", 
                  icon: "fa-brain", 
                  color: "emerald" 
                },
                { 
                  name: "Arduino IoT Cloud", 
                  state: "Conectado", 
                  desc: "Telemetría en Vivo", 
                  icon: "fa-microchip", 
                  color: "emerald" 
                },
                { 
                  name: "Sketchfab API", 
                  state: "Pendiente", 
                  desc: "Modelos 3D de Campo", 
                  icon: "fa-cube", 
                  color: "amber" 
                },
              ].map(({ name, state, desc, icon, color }) => (
                <div
                  key={name}
                  className="flex flex-col justify-between rounded-2xl border border-white/6 bg-black/20 p-4 transition-all duration-200 hover:border-white/12 hover:bg-black/35"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm`}>
                      <i className={`fas ${icon}`}></i>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${state === "Conectado" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/15" : "bg-amber-500/10 text-amber-300 border border-amber-500/15"}`}
                    >
                      {state}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Success Toast (Premium Glassmorphic) */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-3xl border border-emerald-500/30 bg-slate-950/80 px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 animate-bounce">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <i className="fas fa-check text-sm" />
          </div>
          <div>
            <div className="text-sm font-black text-white">Perfil Guardado</div>
            <div className="text-xs text-slate-400">
              Datos actualizados en la base local (localStorage).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

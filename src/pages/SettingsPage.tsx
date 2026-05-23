import { useState, useEffect } from "react";
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

type SubTabId = "profile" | "thresholds" | "integrations";

interface IntegrationItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  status: "connected" | "pending";
  color: "emerald" | "amber";
  docsUrl: string;
}

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

  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("profile");
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados extras demostrativos y profesionales de agricultura inteligente
  const [hectares, setHectares] = useState("45.2");
  const [cropType, setCropType] = useState("Aguacate Hass");
  const [toastMessage, setToastMessage] = useState("Ajustes guardados con éxito.");

  // Integraciones interactivas
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    { 
      id: "gemini",
      name: "Google Gemini 2.5 Flash", 
      desc: "Diagnóstico automático de plagas y salud vegetal por visión computacional.", 
      icon: "fa-magic", 
      status: "connected",
      color: "emerald",
      docsUrl: "https://ai.google.dev/gemini-api"
    },
    { 
      id: "groq",
      name: "Groq · Llama 3", 
      desc: "Motor de inferencia ultra-rápido para el soporte conversacional en campo.", 
      icon: "fa-brain", 
      status: "connected",
      color: "emerald",
      docsUrl: "https://groq.com/"
    },
    { 
      id: "arduino",
      name: "Arduino IoT Cloud", 
      desc: "Sincronización bidireccional en vivo con telemetría de nodos físicos en campo.", 
      icon: "fa-microchip", 
      status: "connected",
      color: "emerald",
      docsUrl: "https://create.arduino.cc/iot"
    },
    { 
      id: "sketchfab",
      name: "Sketchfab API", 
      desc: "Visor interactivo de modelos 3D y gemelos digitales de parcelas y domos.", 
      icon: "fa-cube", 
      status: "pending",
      color: "amber",
      docsUrl: "https://sketchfab.com/developers"
    },
  ]);

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
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("ac_profile", JSON.stringify(profile));
      localStorage.setItem("ac_finca_hectares", hectares);
      localStorage.setItem("ac_finca_croptype", cropType);
      
      setIsSaving(false);
      setToastMessage("Perfil y datos de Finca actualizados.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }, 600);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === "connected" ? "pending" : "connected";
        const nextColor = nextStatus === "connected" ? "emerald" : "amber";
        
        // Disparar toast informativo
        setToastMessage(`${item.name} ha sido ${nextStatus === "connected" ? "conectado" : "desconectado"}.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);

        return { ...item, status: nextStatus, color: nextColor };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Encabezado General Superior */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-white/5 pb-5">
        <div>
          <p className="text-sm text-emerald-400 font-semibold tracking-wider uppercase">Consola de Control</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <i className="fas fa-sliders-h text-emerald-400"></i> Ajustes de Sistema
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Estación Central Sincronizada</span>
          </div>
        </div>
      </div>

      {/* DISEÑO ESTRUCTURADO: Menú Lateral de Sub-Ajustes + Panel de Contenido */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* NAVEGACIÓN LATERAL (3 Columnas) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-[28px] border border-white/8 bg-slate-950/40 backdrop-blur-xl p-4 shadow-xl">
            {/* Header del Menú - Mini Perfil Resumen */}
            <div className="flex items-center gap-3 p-2 mb-4 border-b border-white/5 pb-4">
              <div className="relative h-12 w-12 rounded-full border-2 border-emerald-500/30 overflow-hidden bg-slate-800 flex-shrink-0">
                <img 
                  src="https://media.licdn.com/dms/image/v2/D4D03AQGzNupeLUFAyw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1730153946491?e=2147483647&v=beta&t=IlTbPxy6bAEzcbG5Sz5Fi2AZEPHLeNh9o_QzsPKdP0M" 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{profile.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{profile.org}</div>
              </div>
            </div>

            {/* Lista de sub-pestañas */}
            <nav className="space-y-1">
              {[
                { id: "profile" as SubTabId, label: "Perfil y Finca", icon: "fa-user-cog", desc: "Datos de usuario y terreno" },
                { id: "thresholds" as SubTabId, label: "Umbrales IoT", icon: "fa-sliders-h", desc: "Parámetros de alerta crítica" },
                { id: "integrations" as SubTabId, label: "Integraciones API", icon: "fa-network-wired", desc: "Conexiones de IA y Nube" },
              ].map(({ id, label, icon, desc }) => {
                const isActive = activeSubTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveSubTab(id)}
                    className={`w-full flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left transition-all duration-200 group relative ${
                      isActive 
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-white font-bold" 
                        : "border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-1.5 top-1/3 bottom-1/3 w-1 rounded-full bg-emerald-500"></span>
                    )}
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-sm transition-colors ${
                      isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-400 group-hover:text-white"
                    }`}>
                      <i className={`fas ${icon}`}></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs leading-none">{label}</div>
                      <span className="text-[9px] text-slate-500 block mt-1 font-normal truncate leading-none">{desc}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tarjeta de estado de salud del sistema */}
          <div className="rounded-[28px] border border-white/8 bg-slate-950/20 p-5 shadow-lg text-slate-300 text-xs space-y-3">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
              <span>Estado Operativo</span>
              <span className="text-emerald-400">Excelente</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <i className="fas fa-heartbeat"></i>
              </div>
              <div>
                <div className="font-semibold text-white">Salud General</div>
                <div className="text-[10px] text-slate-400">Sin sensores reportando fallas críticas</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL DINÁMICO (9 Columnas) */}
        <div className="lg:col-span-9">
          
          {/* PESTAÑA 1: PERFIL Y DATOS DE LA FINCA */}
          {activeSubTab === "profile" && (
            <div className="rounded-[30px] border border-white/8 bg-slate-950/40 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:border-white/12">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <i className="fas fa-user-cog text-emerald-400 text-base"></i> Configuración de Cuenta y Finca
                  </h2>
                  <p className="text-xs text-slate-400">Gestione la información del operador general y los parámetros geográficos del predio</p>
                </div>
                <span className="self-start sm:self-auto rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  Estación Central
                </span>
              </div>

              {/* Layout de la Pestaña */}
              <div className="space-y-6">
                
                {/* Cabecera del Perfil con Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-white/[0.02] p-5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group flex-shrink-0">
                    <div className="h-20 w-20 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-xl relative">
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
                  
                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-lg font-bold text-white">{profile.name}</div>
                    <p className="text-xs text-slate-400">Administrador de Estación · Registrado el 15 Mar 2026</p>
                    <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                      <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[9px] text-slate-400">
                        📍 Lat: -12.043 / Long: -77.028
                      </span>
                    </div>
                  </div>
                </div>

                {/* Formulario Formateado en Grilla de 2 Columnas */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block mb-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                      <i className="fas fa-user text-[10px] text-slate-500"></i> Nombre del Operador
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
                      <i className="fas fa-envelope text-[10px] text-slate-500"></i> Correo de Enlace
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

                  <div>
                    <label className="block mb-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                      <i className="fas fa-crop text-[10px] text-slate-500"></i> Cultivo Principal
                    </label>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200"
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                    >
                      <option value="Aguacate Hass" className="bg-slate-900 text-white">Aguacate Hass</option>
                      <option value="Cítricos" className="bg-slate-900 text-white">Cítricos</option>
                      <option value="Hortalizas Orgánicas" className="bg-slate-900 text-white">Hortalizas Orgánicas</option>
                      <option value="Arándanos" className="bg-slate-900 text-white">Arándanos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                      <i className="fas fa-ruler-combined text-[10px] text-slate-500"></i> Superficie (Hectáreas)
                    </label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200"
                      value={hectares}
                      onChange={(e) => setHectares(e.target.value)}
                      placeholder="45.2"
                      type="number"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    className="w-full sm:w-auto rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <i className="fas fa-save"></i>
                    )}
                    {isSaving ? "Guardando..." : "Guardar Perfil y Finca"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: UMBRALES OPERATIVOS */}
          {activeSubTab === "thresholds" && (
            <div className="rounded-[30px] border border-white/8 bg-slate-950/40 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:border-white/12">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <i className="fas fa-bell text-amber-400 text-base"></i> Parámetros de Alerta Crítica (IoT)
                  </h2>
                  <p className="text-xs text-slate-400">Configure los valores límites del suelo. Las alertas se generarán dinámicamente en base a estas reglas.</p>
                </div>
                <span className="self-start sm:self-auto rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  Reactivo IoT
                </span>
              </div>

              {/* Layout Sliders */}
              <div className="space-y-4">
                
                {/* Humedad Slider */}
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-5 transition-all duration-200 hover:bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm">
                        <i className="fas fa-tint"></i>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">Humedad Mínima Crítica</div>
                        <div className="text-[10px] text-slate-500">Mínimo para reportar sensores en estado OK</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl text-xs border border-emerald-500/15">
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
                  <div className="flex justify-between text-[9px] text-slate-600 mt-2 font-mono">
                    <span>10% (Muy Seco)</span>
                    <span>Humedad Actual Recomendada: ~45%</span>
                    <span>80% (Saturado)</span>
                  </div>
                </div>

                {/* Temperatura Slider */}
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-5 transition-all duration-200 hover:bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-sm">
                        <i className="fas fa-thermometer-half"></i>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">Temperatura Suelo Crítica</div>
                        <div className="text-[10px] text-slate-500">Activa avisos de estrés térmico al superarse</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl text-xs border border-amber-500/15">
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
                  <div className="flex justify-between text-[9px] text-slate-600 mt-2 font-mono">
                    <span>15°C (Frío)</span>
                    <span>Límite Crítico: ~30°C</span>
                    <span>50°C (Caliente)</span>
                  </div>
                </div>

                {/* pH Slider */}
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-5 transition-all duration-200 hover:bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 text-sm">
                        <i className="fas fa-vial"></i>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">Acidez Crítica de Suelo (pH)</div>
                        <div className="text-[10px] text-slate-500">Evita desbalances nutricionales extremos</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-xl text-xs border border-violet-500/15">
                      {settings.phThreshold.toFixed(1)} pH
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
                  <div className="flex justify-between text-[9px] text-slate-600 mt-2 font-mono">
                    <span>4.0 (Ácido)</span>
                    <span>Neutro: 7.0 pH</span>
                    <span>10.0 (Alcalino)</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PESTAÑA 3: CONEXIONES API */}
          {activeSubTab === "integrations" && (
            <div className="rounded-[30px] border border-white/8 bg-slate-950/40 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:border-white/12">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <i className="fas fa-project-diagram text-sky-400 text-base"></i> Servicios Conectados e Integraciones API
                  </h2>
                  <p className="text-xs text-slate-400">Habilite o deshabilite los módulos lógicos vinculados a APIs de terceros</p>
                </div>
                <span className="self-start sm:self-auto rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  API Connectors
                </span>
              </div>

              {/* Tarjetas Integraciones Interactivas */}
              <div className="grid gap-4 md:grid-cols-2">
                {integrations.map((item) => {
                  const isConnected = item.status === "connected";
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/6 bg-black/30 p-5 flex flex-col justify-between hover:border-white/12 transition-all duration-200"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-base border ${
                            item.color === "emerald" 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          }`}>
                            <i className={`fas ${item.icon}`}></i>
                          </div>
                          
                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => toggleIntegration(item.id)}
                            className={`h-5.5 w-10.5 rounded-full p-0.5 transition-colors relative flex items-center ${
                              isConnected ? "bg-emerald-500" : "bg-white/10"
                            }`}
                          >
                            <span className={`h-4.5 w-4.5 rounded-full bg-slate-900 transition-transform shadow-md block ${
                              isConnected ? "translate-x-5" : "translate-x-0.5"
                            }`}></span>
                          </button>
                        </div>
                        
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-1.5">
                            {item.name}
                          </div>
                          <p className="text-xs text-slate-400 leading-normal mt-1">{item.desc}</p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className={`font-bold uppercase tracking-wider ${
                          isConnected ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {isConnected ? "● Activo en Consola" : "○ En Espera"}
                        </span>
                        <a 
                          href={item.docsUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                        >
                          Documentación <i className="fas fa-external-link-alt text-[8px]"></i>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Toast de Notificaciones Premium Glassmorphic */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-3xl border border-emerald-500/30 bg-slate-950/90 px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 animate-bounce">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
            <i className="fas fa-check text-sm" />
          </div>
          <div>
            <div className="text-sm font-black text-white">Sincronización Exitosa</div>
            <div className="text-xs text-slate-400">
              {toastMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { PageSection } from '../components/layout/PageSection';
import type { SystemSettings, UserProfile } from '../types/app';

type SettingsPageProps = {
  profile: UserProfile;
  settings: SystemSettings;
  onProfileChange: (profile: UserProfile) => void;
  onSettingsChange: (settings: SystemSettings) => void;
};

export function SettingsPage({ profile, settings, onProfileChange, onSettingsChange }: SettingsPageProps) {
  const updateProfile = (field: keyof UserProfile, value: string) => {
    onProfileChange({ ...profile, [field]: value });
  };

  const updateSettings = (field: keyof SystemSettings, value: number) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <PageSection title="Perfil de usuario" subtitle="Datos básicos">
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-xs text-slate-400">Nombre completo</div>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              value={profile.name}
              onChange={(event) => updateProfile('name', event.target.value)}
              placeholder="Juan Rodríguez"
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-400">Correo electrónico</div>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              value={profile.email}
              onChange={(event) => updateProfile('email', event.target.value)}
              placeholder="juan@agrocontrol.io"
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-400">Finca / Organización</div>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              value={profile.org}
              onChange={(event) => updateProfile('org', event.target.value)}
              placeholder="Finca La Esperanza"
            />
          </div>
          <button className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white" type="button">
            Guardar perfil
          </button>
        </div>
      </PageSection>

      <PageSection title="Integraciones y sistema" subtitle="Configuración demostrativa">
        <div className="space-y-3 text-sm text-slate-300">
          {[
            ['Google Gemini 2.5 Flash', 'Conectado'],
            ['Groq · Llama 3', 'Conectado'],
            ['Arduino IoT Cloud', 'Conectado'],
            ['Sketchfab API', 'Pendiente'],
          ].map(([name, state]) => (
            <div key={name} className="flex items-center justify-between rounded-2xl border border-white/6 bg-black/20 p-4">
              <div>
                <div className="font-semibold text-white">{name}</div>
                <div className="text-xs text-slate-500">Configuración demostrativa</div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${state === 'Conectado' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                {state}
              </span>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection title="Umbrales de alerta" subtitle="Persistidos en localStorage">
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>Humedad mínima crítica</span>
              <span className="font-mono text-white">{settings.humidityThreshold}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={settings.humidityThreshold}
              onChange={(event) => updateSettings('humidityThreshold', Number(event.target.value))}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>Temperatura máxima suelo</span>
              <span className="font-mono text-white">{settings.temperatureThreshold}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              value={settings.temperatureThreshold}
              onChange={(event) => updateSettings('temperatureThreshold', Number(event.target.value))}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>pH mínimo del suelo</span>
              <span className="font-mono text-white">{settings.phThreshold.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="4"
              max="10"
              step="0.1"
              value={settings.phThreshold}
              onChange={(event) => updateSettings('phThreshold', Number(event.target.value))}
            />
          </div>
        </div>
      </PageSection>
    </div>
  );
}

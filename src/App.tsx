import { lazy, Suspense, useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { AiPage } from './pages/AiPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { LandingPage } from './pages/LandingPage';
import { MapPage } from './pages/MapPage';
import { MarketPage } from './pages/MarketPage';
import { ModulePage } from './pages/ModulePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { IotPage } from './pages/IotPage';
import type { AppPageId } from './types/app';
import type { ChatMessage, ChatThreadId, SystemSettings, UserProfile } from './types/app';
import { readJson, writeJson } from './utils/storage';

const STORAGE_KEYS = {
  mode: 'agro_mode',
  page: 'agro_page',
  profile: 'agro_profile',
  settings: 'agro_settings',
  chatMessages: 'agro_chat_messages',
  chatThread: 'agro_chat_thread',
} as const;

const pageTitles: Record<AppPageId, string> = {
  dashboard: 'Dashboard',
  iot: 'Sensores IoT',
  ai: 'Diagnóstico IA',
  chat: 'Asistente & Expertos',
  market: 'Marketplace',
  map: 'Mapa Interactivo',
  modelos3d: 'Modelos 3D',
  reportes: 'Reportes',
  settings: 'Configuración',
};

const defaultProfile: UserProfile = {
  name: 'Juan Rodríguez',
  email: 'juan@agrocontrol.io',
  org: 'Finca La Esperanza',
};

const defaultSettings: SystemSettings = {
  humidityThreshold: 40,
  temperatureThreshold: 30,
  phThreshold: 6,
};

const defaultMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'bot',
    text: '¡Hola! Soy el asistente de Agro Control. Estoy conectado a los sensores de tus parcelas y puedo ayudarte con diagnósticos y recomendaciones.',
    timestamp: Date.now(),
  },
];

const chatReplies = [
  'Para controlar plagas orgánicamente te recomiendo rotación de cultivos y jabón potásico. ¿Quieres un plan para tu tipo específico de cultivo?',
  'La humedad óptima para hortalizas está entre 60–75%. Con tus sensores puedo configurar alertas automáticas cuando caiga de ese rango.',
  'Basándome en los datos del Sector 3B, necesita intervención en las próximas 24h. ¿Te conecto con un agrónomo disponible ahora?',
  'El bicarbonato de sodio es efectivo contra hongos superficiales. Aplica 5g/L en spray foliar, preferiblemente en la mañana para evitar quemaduras.',
  'Los sensores de Parcela Norte muestran condiciones óptimas. La fertilidad está en 94% — excelente momento para la siguiente siembra.',
];

const LazyModels3dPage = lazy(() => import('./pages/Models3dPage').then((module) => ({ default: module.Models3dPage })));

function App() {
  const [mode, setMode] = useState<'landing' | 'app'>('landing');
  const [currentPage, setCurrentPage] = useState<AppPageId>(() => readJson(STORAGE_KEYS.page, 'dashboard'));
  const [profile, setProfile] = useState<UserProfile>(() => readJson(STORAGE_KEYS.profile, defaultProfile));
  const [settings, setSettings] = useState<SystemSettings>(() => readJson(STORAGE_KEYS.settings, defaultSettings));
  const [selectedChat, setSelectedChat] = useState<ChatThreadId>(() => readJson(STORAGE_KEYS.chatThread, 'bot'));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => readJson(STORAGE_KEYS.chatMessages, defaultMessages));

  useEffect(() => {
    writeJson(STORAGE_KEYS.mode, mode);
  }, [mode]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.page, currentPage);
  }, [currentPage]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.profile, profile);
  }, [profile]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.settings, settings);
  }, [settings]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.chatThread, selectedChat);
  }, [selectedChat]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.chatMessages, chatMessages);
  }, [chatMessages]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'iot':
        return <IotPage />;
      case 'ai':
        return <AiPage />;
      case 'market':
        return <MarketPage />;
      case 'map':
        return <MapPage />;
      case 'modelos3d':
        return (
          <Suspense
            fallback={
              <div className="rounded-[14px] border border-white/6 bg-[#27293d] p-6 text-sm text-slate-400 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                Cargando modelos 3D...
              </div>
            }
          >
            <LazyModels3dPage />
          </Suspense>
        );
      case 'reportes':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage profile={profile} settings={settings} onProfileChange={setProfile} onSettingsChange={setSettings} />;
      case 'chat':
        return (
          <ChatPage
            selectedChat={selectedChat}
            messages={chatMessages}
            onSelectChat={setSelectedChat}
            onSendMessage={(text) => {
              const now = Date.now();
              const userMessage: ChatMessage = {
                id: `user-${now}`,
                role: 'user',
                text,
                timestamp: now,
              };

              setChatMessages((current) => {
                const reply = chatReplies[current.length % chatReplies.length];
                const botMessage: ChatMessage = {
                  id: `bot-${now}`,
                  role: 'bot',
                  text: reply,
                  timestamp: now + 1,
                };

                return [...current, userMessage, botMessage];
              });
            }}
          />
        );
      default:
        return <ModulePage page={currentPage} title="Módulo" subtitle="Vista modular" />;
    }
  };

  return mode === 'landing' ? (
    <>
      <LandingPage
        onEnterApp={() => {
          setCurrentPage('dashboard');
          setMode('app');
        }}
      />
    </>
  ) : (
    <>
      <AppShell
        currentPage={currentPage}
        pageTitle={pageTitles[currentPage]}
        profile={profile}
        onNavigate={setCurrentPage}
        onBackToLanding={() => {
          setCurrentPage('dashboard');
          setMode('landing');
        }}
      >
        {renderPage()}
      </AppShell>
    </>
  );
}

export default App;

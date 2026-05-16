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
import { generateGroqChatReply } from './services/groqChat';
import type { AppPageId, ChatMessage, ChatMessagesByThread, ChatThreadId, SystemSettings, UserProfile } from './types/app';
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

const createDefaultChatMessages = (): ChatMessagesByThread => {
  const now = Date.now();

  return {
    bot: [
      {
        id: 'welcome-bot',
        role: 'bot',
        text: '¡Hola! Soy el asistente de Agro Control. Puedo ayudarte a entender la plataforma, revisar módulos, interpretar sensores y navegar por la aplicación.',
        timestamp: now,
      },
    ],
    expert1: [
      {
        id: 'welcome-expert1',
        role: 'bot',
        text: 'Soy María Campos. Puedo ayudarte con consultas sobre cultivos y cómo aprovechar los módulos de Agro Control para ese caso.',
        timestamp: now,
      },
    ],
    expert2: [
      {
        id: 'welcome-expert2',
        role: 'bot',
        text: 'Soy Jorge Méndez. Si necesitas interpretar suelos, fertilización o umbrales, este hilo está listo para eso.',
        timestamp: now,
      },
    ],
    expert3: [
      {
        id: 'welcome-expert3',
        role: 'bot',
        text: 'Soy Ana López. Aquí podemos revisar plagas, diagnóstico preventivo y el uso de la plataforma para esas alertas.',
        timestamp: now,
      },
    ],
  };
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<ChatMessage>;
  return (
    typeof candidate.id === 'string' &&
    (candidate.role === 'user' || candidate.role === 'bot') &&
    typeof candidate.text === 'string' &&
    typeof candidate.timestamp === 'number'
  );
}

function normalizeChatMessages(value: unknown): ChatMessagesByThread {
  const defaults = createDefaultChatMessages();

  if (Array.isArray(value)) {
    return {
      ...defaults,
      bot: value.filter(isChatMessage),
    };
  }

  if (!value || typeof value !== 'object') {
    return defaults;
  }

  const candidate = value as Partial<Record<ChatThreadId, unknown>>;

  return {
    bot: Array.isArray(candidate.bot) ? candidate.bot.filter(isChatMessage) : defaults.bot,
    expert1: Array.isArray(candidate.expert1) ? candidate.expert1.filter(isChatMessage) : defaults.expert1,
    expert2: Array.isArray(candidate.expert2) ? candidate.expert2.filter(isChatMessage) : defaults.expert2,
    expert3: Array.isArray(candidate.expert3) ? candidate.expert3.filter(isChatMessage) : defaults.expert3,
  };
}

const LazyModels3dPage = lazy(() => import('./pages/Models3dPage').then((module) => ({ default: module.Models3dPage })));

function App() {
  const [mode, setMode] = useState<'landing' | 'app'>('landing');
  const [currentPage, setCurrentPage] = useState<AppPageId>(() => readJson(STORAGE_KEYS.page, 'dashboard'));
  const [profile, setProfile] = useState<UserProfile>(() => readJson(STORAGE_KEYS.profile, defaultProfile));
  const [settings, setSettings] = useState<SystemSettings>(() => readJson(STORAGE_KEYS.settings, defaultSettings));
  const [selectedChat, setSelectedChat] = useState<ChatThreadId>(() => readJson(STORAGE_KEYS.chatThread, 'bot'));
  const [chatMessagesByThread, setChatMessagesByThread] = useState<ChatMessagesByThread>(() => normalizeChatMessages(readJson(STORAGE_KEYS.chatMessages, createDefaultChatMessages())));
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

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
    writeJson(STORAGE_KEYS.chatMessages, chatMessagesByThread);
  }, [chatMessagesByThread]);

  useEffect(() => {
    setChatError(null);
  }, [selectedChat]);

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
            messages={chatMessagesByThread[selectedChat] ?? []}
            onSelectChat={setSelectedChat}
            isSending={isChatSending}
            errorMessage={chatError}
            onSendMessage={async (text) => {
              const thread = selectedChat;
              const now = Date.now();
              const userMessage: ChatMessage = {
                id: `user-${thread}-${now}`,
                role: 'user',
                text,
                timestamp: now,
              };

              const threadMessages = [...(chatMessagesByThread[thread] ?? []), userMessage];

              setChatError(null);
              setIsChatSending(true);
              setChatMessagesByThread((current) => ({
                ...current,
                [thread]: threadMessages,
              }));

              try {
                const replyText = await generateGroqChatReply({
                  thread,
                  messages: threadMessages,
                  profile,
                  settings,
                });

                const botMessage: ChatMessage = {
                  id: `bot-${thread}-${now}`,
                  role: 'bot',
                  text: replyText,
                  timestamp: now + 1,
                };

                setChatMessagesByThread((current) => ({
                  ...current,
                  [thread]: [...(current[thread] ?? []), botMessage],
                }));
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'No fue posible conectar con Groq.';
                setChatError(errorMessage);

                const botMessage: ChatMessage = {
                  id: `bot-error-${thread}-${now}`,
                  role: 'bot',
                  text: `No pude responder ahora mismo: ${errorMessage}`,
                  timestamp: now + 1,
                };

                setChatMessagesByThread((current) => ({
                  ...current,
                  [thread]: [...(current[thread] ?? []), botMessage],
                }));
              } finally {
                setIsChatSending(false);
              }
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

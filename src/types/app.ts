export type AppPageId =
  | 'dashboard'
  | 'iot'
  | 'ai'
  | 'chat'
  | 'market'
  | 'map'
  | 'modelos3d'
  | 'reportes'
  | 'settings';

export type NavigationItem = {
  id: AppPageId;
  label: string;
  icon: string;
  section: 'principal' | 'modulos' | 'sistema';
  badge?: string;
};

export type UserProfile = {
  name: string;
  email: string;
  org: string;
};

export type SystemSettings = {
  humidityThreshold: number;
  temperatureThreshold: number;
  phThreshold: number;
};

export type ChatThreadId = 'bot' | 'expert1' | 'expert2' | 'expert3';

export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
};

export type ChatMessagesByThread = Record<ChatThreadId, ChatMessage[]>;

import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { IotPage } from '../pages/IotPage';
import { AiPage } from '../pages/AiPage';
import { ChatPage } from '../pages/ChatPage';
import { MarketPage } from '../pages/MarketPage';
import { MapPage } from '../pages/MapPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { Models3dPage } from '../pages/Models3dPage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

function AppLayout() {
  const { user } = useAuth();
  
  // Si no hay usuario (caso raro porque ProtectedRoute lo previene), usamos un fallback temporal
  const profile = user || { name: 'Invitado', email: '', org: '' };

  return <AppShell profile={profile} />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="iot" element={<IotPage />} />
        <Route path="ai" element={<AiPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="modelos3d" element={<Models3dPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { AppShell } from "../components/layout/AppShell";

import { DashboardPage } from "../pages/DashboardPage";
import { IotPage } from "../pages/IotPage";
import { AiPage } from "../pages/AiPage";
import { ChatPage } from "../pages/ChatPage";
import { MarketPage } from "../pages/MarketPage";
import { MapPage } from "../pages/MapPage";
import { ReportsPage } from "../pages/ReportsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { Models3dPage } from "../pages/Models3dPage";
import { UserProfile } from "../types/app";

const defaultProfile: UserProfile = {
  name: "Juan Rodríguez",
  email: "juan@agrocontrol.io",
  org: "Finca La Esperanza",
};

export function AppRouter() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/app" element={<AppShell profile={defaultProfile} />}>
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
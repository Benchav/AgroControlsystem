import type { AppPageId, UserProfile } from "../../types/app";
import { navigation } from "../../config/navigation";
import { cn } from "../../lib/cn";
import { useEffect, useState, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAlerts } from "../../hooks/useAlerts";

type AppShellProps = {
  profile: UserProfile;
};

const sectionLabels = {
  principal: "Principal",
  modulos: "Módulos",
  sistema: "Sistema",
} as const;

const badgeTone = (badge?: string) => {
  if (!badge) return "";
  if (badge === "1") return "bg-amber-500 text-[#1a1100]";
  if (badge === "2") return "bg-red-500 text-white";
  return "bg-emerald-500/15 text-emerald-300 border border-white/10";
};

const mobileNavItems = [
  { id: 'dashboard', label: 'Inicio', icon: 'fa-th-large' },
  { id: 'map', label: 'Mapa', icon: 'fa-map-marked-alt' },
  { id: 'ai', label: 'IA', icon: 'fa-brain' },
  { id: 'chat', label: 'Chat', icon: 'fa-comments' },
  { id: 'settings', label: 'Más', icon: 'fa-ellipsis-h' },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell({ profile }: AppShellProps) {
  // 1. Consumimos el hook de alertas
  const { alerts, redCount, amberCount } = useAlerts();

  // 2. Filtramos y calculamos los totales de notificaciones pendientes
  const activeAlerts = alerts.filter((alert) => !alert.resolved);
  const totalActiveNotifications = activeAlerts.length;

  // 3. Generamos el texto del tooltip informativo rápido
  const tooltipText = totalActiveNotifications > 0
    ? `Tienes ${totalActiveNotifications} alertas pendientes (${redCount} críticas, ${amberCount} de atención)`
    : "No tienes alertas pendientes";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [, , routePage = 'dashboard'] = location.pathname.split('/');
  const currentPage = routePage as AppPageId;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  const pageTitles: Record<AppPageId, string> = {
    dashboard: "Dashboard",
    iot: "Sensores IoT",
    ai: "Diagnóstico IA",
    chat: "Asistente & Expertos",
    market: "Subastas",
    map: "Mapa Interactivo",
    modelos3d: "Modelos 3D",
    reportes: "Reportes",
    settings: "Configuración",
  };

  const pageTitle = pageTitles[currentPage] || "Dashboard";

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  const handleNavigate = (page: AppPageId) => {
    setIsMobileMenuOpen(false);
    navigate(`/app/${page}`);
  };

  const handleBackToLanding = () => {
    setIsMobileMenuOpen(false);
    navigate(`/`);
  };

  const handleBellClick = () => {
    navigate("/app/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0c0c49] text-[#f8fafc]">
      <div className="flex min-h-screen">
        {isMobileMenuOpen ? (
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-40 bg-black/60 xl:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            "fixed top-0 left-0 h-screen w-72 xl:w-64 z-50 flex-col border-r border-white/5 bg-[#051c1a] transition-transform duration-200 overflow-hidden bg-no-repeat",
            isMobileMenuOpen
              ? "translate-x-0 flex"
              : "-translate-x-full xl:translate-x-0 xl:flex",
          )}
          style={{
            backgroundImage: `
              linear-gradient(
                to top,
                rgba(5,28,26,0.55) 0%,
                rgba(5,28,26,0.85) 35%,
                rgba(5,28,26,0.98) 70%,
                rgba(5,28,26,1) 100%
              ),
              url('/leavesSidebar.png')
            `,
            backgroundPosition: "left bottom",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        >
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/80 transition hover:border-white/20 hover:bg-black/50 hover:text-white xl:hidden"
          >
            <i className="fas fa-times text-[13px]" />
          </button>

          <button
            type="button"
            onClick={handleBackToLanding}
            className="border-b border-white/45 px-5 py-4 pr-14 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-emerald-500 to-emerald-700 text-[18px] shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden">
                <img
                  src="/Logo.png"
                  alt="Agro Control"
                  className="h-full w-full"
                />
              </div>
              <div>
                <div className="text-[18px] font-bold tracking-[-0.5px] text-white/80">
                  Agro Control
                </div>
                <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.35em] text-white/60">
                  Smart Farm v2.0
                </div>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 border-b border-white/5 bg-emerald-500/[0.03] px-5 py-2.5 font-mono text-[10.5px] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]" />
            SYS ONLINE · 24 sensores
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide">
            {(["principal", "modulos", "sistema"] as const).map((section) => (
              <div key={section} className="space-y-2 mt-2">
                <div className="px-2 text-[9px] font-medium uppercase tracking-[0.35em] text-slate-500">
                  {sectionLabels[section]}
                </div>
                <div className="space-y-0.5">
                  {navigation
                    .filter((item) => item.section === section)
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        className={cn(
                          "relative flex w-full items-center gap-2 rounded-[8px] border border-transparent px-3 py-2.5 text-left text-[13px] font-medium transition",
                          currentPage === item.id
                            ? "border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.12] to-emerald-500/[0.03] text-emerald-300"
                            : "text-slate-400 hover:border-white/10 hover:bg-emerald-500/[0.04] hover:text-white",
                        )}
                      >
                        {currentPage === item.id ? (
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-[3px] bg-emerald-400" />
                        ) : null}
                        <i
                          className={cn(
                            "fas",
                            item.icon,
                            "w-[18px] text-center text-[13px]",
                            currentPage === item.id
                              ? "opacity-100"
                              : "opacity-60",
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge ? (
                          <span
                            className={cn(
                              "ml-auto min-w-[18px] rounded-full px-1.5 py-0.5 text-center font-mono text-[9px] font-bold",
                              badgeTone(item.badge),
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3 border-t border-white/40 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-emerald-900 to-emerald-950 text-[12px] font-bold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              {getInitials(profile.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-white/80">
                {profile.name}
              </div>
              <div className="truncate text-[10px] text-white/60">
                Administrador
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate("settings")}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/10 bg-transparent text-slate-400 transition hover:border-white/20 hover:text-emerald-300"
            >
              <i className="fas fa-cog" />
            </button>
          </div>
        </aside>

        <main
          className="ml-0 xl:ml-64 flex h-screen flex-1 flex-col overflow-hidden bg-[#01040b] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(0,0,0,0.35),
                rgba(0,0,0,0.65)
              ),
              url('/leavesMain.png')
            `,
          }}
        >
          <header className="sticky top-0 z-20 border-b border-white/5 px-4 py-[14px] backdrop-blur md:px-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-[16px] font-bold tracking-[-0.3px] text-white md:text-[18px]">
                  {pageTitle}
                </h1>
                <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                  Agro Control / {pageTitle}
                </p>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/10 bg-[#27293d] text-slate-300 transition hover:border-white/20 hover:text-emerald-300 xl:hidden"
                  type="button"
                  aria-label="Abrir menú"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <i className="fas fa-bars" />
                </button>
                <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/[0.07] px-4 py-2 text-[11.5px] font-medium text-emerald-300 md:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.75)]" />
                  24 sensores activos
                </div>
                <button
                  onClick={handleBellClick}
                  title={tooltipText} // Tooltip al hacer hover
                  className="relative flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/10 bg-[#27293d] text-slate-300 transition hover:border-white/20 hover:text-emerald-300 cursor-pointer"
                  type="button"
                >
                  <i className="fas fa-bell" />

                  {/* Badge de Alertas Activas */}
                  {totalActiveNotifications > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold font-mono text-white ring-2 ring-[#01040b] shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse">
                      {totalActiveNotifications}
                    </span>
                  )}
                </button>
                {/* <button
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/10 bg-[#27293d] text-slate-300 transition hover:border-white/20 hover:text-emerald-300"
                  type="button"
                >
                  <i className="fas fa-search" />
                </button> */}
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/10 bg-[#27293d] text-slate-300 transition hover:border-white/20 hover:text-emerald-300 xl:hidden"
                  type="button"
                  onClick={handleBackToLanding}
                >
                  <i className="fas fa-home" />
                </button>
              </div>
            </div>
          </header>

          <section className="flex-1 overflow-y-auto px-4 py-5 pb-24 md:pb-5">
            <Outlet />
          </section>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#081114]/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl xl:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'settings') {
                    setIsMobileMenuOpen(true);
                    return;
                  }

                  handleNavigate(item.id);
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-[11px] font-medium transition',
                  isActive
                    ? 'bg-emerald-500/12 text-emerald-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )}
              >
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-full border transition', isActive ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-300')}>
                  <i className={cn('fas', item.icon)} />
                </span>
                <span className="leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

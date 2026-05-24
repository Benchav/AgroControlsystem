import { useEffect, useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

/**
 * PWAInstallBanner
 *
 * Banner premium de instalación de la PWA.
 * Se muestra como un banner flotante en la parte inferior de la pantalla,
 * con animación de entrada/salida, glassmorphism, y lógica inteligente
 * para no ser invasivo (cooldown de 7 días tras descartar).
 *
 * Compatible con desktop (Chrome, Edge) y móvil (Android Chrome, Samsung Internet).
 * En iOS Safari no se soporta `beforeinstallprompt` — el banner no se mostrará.
 */
export function PWAInstallBanner() {
  const { canInstall, isInstalled, promptInstall, dismiss } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Mostrar con un delay de 2 segundos para no interrumpir la carga inicial
  useEffect(() => {
    if (!canInstall || isInstalled) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [canInstall, isInstalled]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      dismiss();
    }, 300);
  };

  const handleInstall = async () => {
    await promptInstall();
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 300);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop sutil — solo en móvil para dar enfoque */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 xl:hidden ${exiting ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleDismiss}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Instalar Agro Control"
        className={`pwa-install-banner fixed z-[9999] transition-all duration-300 ease-out
          ${exiting ? 'pwa-install-banner--exit' : 'pwa-install-banner--enter'}
          /* Mobile: full-width bottom */
          inset-x-0 bottom-0
          /* Desktop: centered bottom with max-width */
          xl:inset-x-auto xl:left-1/2 xl:bottom-6 xl:-translate-x-1/2 xl:max-w-[480px] xl:rounded-2xl
        `}
      >
        <div
          className={`
            relative overflow-hidden
            border-t border-white/10 bg-[#0b1a18]/90 backdrop-blur-xl
            xl:rounded-2xl xl:border xl:border-white/10 xl:shadow-[0_8px_40px_rgba(0,0,0,0.5)]
            p-4 sm:p-5
          `}
        >
          {/* Gradiente decorativo superior */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />

          {/* Glow ambiental */}
          <div className="absolute -top-12 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative flex items-start gap-4">
            {/* Ícono de la app */}
            <div className="flex-shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <img
                  src="/Logo.png"
                  alt="Agro Control"
                  className="h-10 w-10 rounded-lg object-contain"
                />
              </div>
            </div>

            {/* Contenido */}
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold tracking-[-0.3px] text-white">
                Instalar Agro Control
              </h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-400">
                Accede más rápido y trabaja sin conexión. Funciona como app nativa en tu dispositivo.
              </p>

              {/* Chips de beneficios */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { icon: 'fa-bolt', text: 'Acceso rápido' },
                  { icon: 'fa-wifi-slash', text: 'Sin conexión' },
                  { icon: 'fa-expand', text: 'Pantalla completa' },
                ].map((chip) => (
                  <span
                    key={chip.text}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.04] px-2.5 py-1 text-[10.5px] font-medium text-emerald-300/80"
                  >
                    <i className={`fas ${chip.icon} text-[9px] opacity-70`} />
                    {chip.text}
                  </span>
                ))}
              </div>

              {/* Botones */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleInstall}
                  className="group relative flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all duration-200 hover:border-emerald-400/50 hover:shadow-[0_0_28px_rgba(16,185,129,0.4)] active:scale-[0.97]"
                >
                  <i className="fas fa-download text-[12px] transition-transform duration-200 group-hover:-translate-y-0.5" />
                  Instalar
                  <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] font-medium text-slate-400 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.97]"
                >
                  Ahora no
                </button>
              </div>
            </div>

            {/* Botón cerrar (X) */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Cerrar"
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-slate-500 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <i className="fas fa-times" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';

const SESSION_KEY_DISMISSED = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export interface PWAInstallState {
  /** true cuando el navegador ofrece la instalación y no fue descartada en esta sesión */
  canInstall: boolean;
  /** true cuando la app se está ejecutando actualmente en modo standalone */
  isInstalled: boolean;
  /** Dispara el prompt nativo de instalación */
  promptInstall: () => Promise<void>;
  /** Descarta el banner solo para esta sesión */
  dismiss: () => void;
}

export function usePWAInstall(): PWAInstallState {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // ─── Detectar si la app corre actualmente en modo standalone ─────
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone === true; // Safari iOS

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Escuchar si la ventana cambia de modo (ej. si se instala y se abre)
    const mql = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setCanInstall(false);
      }
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // ─── Capturar el evento beforeinstallprompt ─────────────────────
  // Dejamos que el navegador sea la ÚNICA fuente de verdad.
  // Si la app está instalada en el sistema operativo, el navegador no disparará 'beforeinstallprompt'.
  // Si el usuario desinstala la app, el navegador volverá a disparar 'beforeinstallprompt' automáticamente.
  useEffect(() => {
    if (isInstalled) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir el mini-infobar nativo de Chrome
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;

      // Si ya la descartó en esta pestaña/sesión, no mostrar de inmediato
      if (sessionStorage.getItem(SESSION_KEY_DISMISSED) === 'true') {
        return;
      }

      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPrompt.current = null;
      sessionStorage.removeItem(SESSION_KEY_DISMISSED);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  // ─── Disparar el prompt nativo ──────────────────────────────────
  const promptInstall = useCallback(async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) return;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      sessionStorage.removeItem(SESSION_KEY_DISMISSED);
    }

    setCanInstall(false);
    deferredPrompt.current = null;
  }, []);

  // ─── Descartar el banner (solo esta sesión) ─────────────────────
  const dismiss = useCallback(() => {
    setCanInstall(false);
    sessionStorage.setItem(SESSION_KEY_DISMISSED, 'true');
  }, []);

  return { canInstall, isInstalled, promptInstall, dismiss };
}

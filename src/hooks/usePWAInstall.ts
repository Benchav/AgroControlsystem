import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY_INSTALLED = 'pwa-install-completed';
const SESSION_KEY_DISMISSED = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export interface PWAInstallState {
  /** true cuando el navegador ofrece la instalación y no fue descartada en esta sesión */
  canInstall: boolean;
  /** true cuando la app ya corre en modo standalone / twa / minimal-ui */
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

  // ─── Detectar si la app ya corre en modo standalone ──────────────
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone === true; // Safari iOS

    if (isStandalone || localStorage.getItem(STORAGE_KEY_INSTALLED) === 'true') {
      setIsInstalled(true);
      return;
    }

    // Escuchar cambios por si el usuario instala mientras la app está abierta
    const mql = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setCanInstall(false);
        localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      }
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // ─── Capturar el evento beforeinstallprompt ─────────────────────
  useEffect(() => {
    if (isInstalled) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que el navegador muestre su propio mini-infobar
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;

      // Si el usuario ya descartó el banner en ESTA sesión, no volver a mostrarlo
      if (sessionStorage.getItem(SESSION_KEY_DISMISSED) === 'true') {
        return;
      }

      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPrompt.current = null;
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
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
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
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

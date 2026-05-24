import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cooldown en milisegundos antes de volver a mostrar el banner
 * después de que el usuario lo descartó. (7 días)
 */
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const STORAGE_KEY_DISMISSED = 'pwa-install-dismissed-at';
const STORAGE_KEY_INSTALLED = 'pwa-install-completed';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export interface PWAInstallState {
  /** true cuando el navegador ofrece la instalación y no fue descartada recientemente */
  canInstall: boolean;
  /** true cuando la app ya corre en modo standalone / twa / minimal-ui */
  isInstalled: boolean;
  /** Dispara el prompt nativo de instalación */
  promptInstall: () => Promise<void>;
  /** Descarta el banner y registra cooldown */
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

      // Verificar si el usuario lo descartó recientemente
      const dismissedAt = localStorage.getItem(STORAGE_KEY_DISMISSED);
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < DISMISS_COOLDOWN_MS) {
          return; // Aún en cooldown, no mostrar
        }
        localStorage.removeItem(STORAGE_KEY_DISMISSED);
      }

      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Si el usuario instala desde el propio banner del navegador
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPrompt.current = null;
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      localStorage.removeItem(STORAGE_KEY_DISMISSED);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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
      localStorage.removeItem(STORAGE_KEY_DISMISSED);
    }

    setCanInstall(false);
    deferredPrompt.current = null;
  }, []);

  // ─── Descartar el banner ────────────────────────────────────────
  const dismiss = useCallback(() => {
    setCanInstall(false);
    localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
  }, []);

  return { canInstall, isInstalled, promptInstall, dismiss };
}

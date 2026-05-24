import { useCallback, useEffect, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export interface PWAInstallState {
  /** true cuando el navegador ofrece la instalación y no fue descartada en esta carga de página */
  canInstall: boolean;
  /** true cuando la app se está ejecutando actualmente en modo standalone */
  isInstalled: boolean;
  /** Dispara el prompt nativo de instalación */
  promptInstall: () => Promise<void>;
  /** Descarta el banner para esta carga de página (se restablece al recargar) */
  dismiss: () => void;
}

export function usePWAInstall(): PWAInstallState {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

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
  useEffect(() => {
    if (isInstalled) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;

      // Si ya la descartó en esta carga de página, no volver a mostrar
      if (isDismissed) {
        return;
      }

      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPrompt.current = null;
      setIsDismissed(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, isDismissed]);

  // ─── Disparar el prompt nativo ──────────────────────────────────
  const promptInstall = useCallback(async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) return;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsDismissed(false);
    }

    setCanInstall(false);
    deferredPrompt.current = null;
  }, []);

  // ─── Descartar el banner (se restablece al refrescar) ───────────
  const dismiss = useCallback(() => {
    setCanInstall(false);
    setIsDismissed(true);
  }, []);

  return { canInstall, isInstalled, promptInstall, dismiss };
}

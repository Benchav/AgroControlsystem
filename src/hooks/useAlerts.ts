import { useState, useEffect } from 'react';
import { Alert } from '../entities/alert_model';
import { initialAlerts } from '../data/alert_data';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = localStorage.getItem('ac_alerts');
      return saved ? JSON.parse(saved) : initialAlerts;
    } catch (e) {
      return initialAlerts;
    }
  });

  useEffect(() => {
    localStorage.setItem('ac_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const resolveAlert = (id: string) => setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));

  return { alerts, resolveAlert, setAlerts };
}

export default useAlerts;

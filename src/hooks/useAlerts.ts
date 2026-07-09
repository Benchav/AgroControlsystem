import { useState, useEffect } from 'react';
import { Alert } from '../entities/alert_model';
import { initialAlerts } from '../data/alert_data';
import { useParcels } from './useParcels';
import { useMarket } from './useMarket';
import { useNavigate } from 'react-router-dom';

export function useAlerts() {
  const navigate = useNavigate();
  const { parcels } = useParcels();
  const { items: marketItems } = useMarket();

  // 1. Mantener tu estado original con localStorage
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

  // 2. NUEVA IMPLEMENTACIÓN: Escuchar sensores y subastas en tiempo real
  useEffect(() => {
    const now = new Date();

    setAlerts((prevAlerts) => {
      // Clonamos el estado actual para no mutarlo directamente
      let updatedAlerts = [...prevAlerts];

      // === PROCESAR ALERTAS DE PARCELAS ===
      parcels.forEach((parcel) => {
        const numericHumidity = parseFloat(parcel.humidity) || 0;
        const numericFertility = parseFloat(parcel.fertility) || 0;

        // Caso A: Plaga / Crítico general (Rojo)
        const toneId = `parcel-tone-${parcel.id}`;
        if (parcel.statusTone === "critico" && !updatedAlerts.some(a => a.id === toneId)) {
          updatedAlerts.push({
            id: toneId,
            emoji: "🚨",
            title: `Plaga o Anomalía — ${parcel.name}`,
            description: `El sector requiere intervención agronómica prioritaria de inmediato.`,
            time: "Ahora",
            severity: "red",
            resolved: false,
            source: "telemetria",
            targetPage: "parcels",
            targetId: parcel.id,
          });
        }

        // Caso B: Humedad Crítica (Amber)
        const humId = `parcel-hum-${parcel.id}`;
        if (numericHumidity < 35 && !updatedAlerts.some(a => a.id === humId)) {
          updatedAlerts.push({
            id: humId,
            emoji: "💧",
            title: `Humedad baja — ${parcel.name}`,
            description: `Nivel al ${numericHumidity}% — se recomienda activar el riego urgente.`,
            time: "Hace poco",
            severity: "amber",
            resolved: false,
            source: "telemetria",
            targetPage: "parcels",
            targetId: parcel.id,
          });
        }

        // Caso C: Nutrientes / Fertilidad Baja (Amber)
        const fertId = `parcel-fert-${parcel.id}`;
        if (numericFertility < 50 && !updatedAlerts.some(a => a.id === fertId)) {
          updatedAlerts.push({
            id: fertId,
            emoji: "🌱",
            title: `Nutrientes Bajos — ${parcel.name}`,
            description: `Suelo al ${numericFertility}%. Considerar plan de fertilización.`,
            time: "Ayer",
            severity: "amber",
            resolved: false,
            source: "telemetria",
            targetPage: "parcels",
            targetId: parcel.id,
          });
        }
      });

      // === PROCESAR ALERTAS DE SUBASTAS ===
      marketItems.forEach((item) => {
        const isClosedStatus = item.status === "no disponible" || item.status === "pendiente";
        const isExpired = item.endDate && new Date(item.endDate) <= now;

        // Caso A: Subasta terminada o vendida (Cyan)
        const endId = `market-end-${item.id}`;
        if ((isClosedStatus || isExpired) && !updatedAlerts.some(a => a.id === endId)) {
          updatedAlerts.push({
            id: endId,
            emoji: "🔨",
            title: `Subasta Finalizada — ${item.name}`,
            description: `El ciclo comercial concluyó con éxito a un valor de $${item.price.toFixed(2)}.`,
            time: "Cerrado",
            severity: "cyan",
            resolved: true, // Nace resuelta por ser informativa
            source: "subasta",
            targetPage: "market",
            targetId: item.id,
          });
        }
      });

      // Evitamos re-renderizados infinitos comparando si el largo cambió o algo se agregó
      if (updatedAlerts.length !== prevAlerts.length) {
        // Opcional: Mantenerlas ordenadas (Rojo -> Ámbar -> Cyan)
        const priority = { red: 1, amber: 2, cyan: 3 };
        return updatedAlerts.sort((a, b) => (priority[a.severity] || 3) - (priority[b.severity] || 3));
      }

      return prevAlerts;
    });
  }, [parcels, marketItems]);

  // 3. NUEVA IMPLEMENTACIÓN: Redirección inteligente al hacer clic en la alerta
  const handleAlertClick = (alert: Alert) => {
    if (alert.targetPage === "parcels") {
      navigate("/app/map", { state: { highlightParcelId: alert.targetId } });
    } else if (alert.targetPage === "market") {
      navigate("/app/market", { state: { openAuctionId: alert.targetId } });
    } else {
      navigate("/app/dashboard");
    }
  };

  // 4. Tu función original para resolver alertas instaladas
  const resolveAlert = (id: string) => 
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));

  return { 
    alerts, 
    resolveAlert, 
    setAlerts, 
    handleAlertClick, // Exportamos la navegación
    redCount: alerts.filter((a) => a.severity === "red" && !a.resolved).length,
    amberCount: alerts.filter((a) => a.severity === "amber" && !a.resolved).length 
  };
}

export default useAlerts;
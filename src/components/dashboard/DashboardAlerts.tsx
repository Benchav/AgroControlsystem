import { Alert } from '../../entities/alert_model';
import useAlerts from '../../hooks/useAlerts';
import { PageSection } from '../layout/PageSection';

export function DashboardAlerts() {
  // Consumimos las alertas unificadas y las funciones de acción de tu hook
  const { alerts, resolveAlert, handleAlertClick } = useAlerts();

  // Filtramos para mostrar únicamente las alertas que NO han sido resueltas
  const activeAlerts = alerts.filter((alert) => !alert.resolved);

  return (
    <PageSection title="Alertas recientes" subtitle="Monitoreo automático 24/7">
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {activeAlerts.map((alert: Alert) => {
          const tone = alert.severity; // 'red' | 'amber' | 'cyan'

          return (
            <div
              key={alert.id}
              onClick={() => handleAlertClick(alert)}
              className={`group flex items-start justify-between gap-3 rounded-[10px] border p-4 cursor-pointer transition-all duration-200  ${
                tone === 'red'
                  ? 'border-red-400/40 bg-red-500/25 hover:bg-red-500/30'
                  : tone === 'amber'
                  ? 'border-amber-400/40 bg-amber-500/25 hover:bg-amber-500/30'
                  : 'border-cyan-400/40 bg-cyan-500/25 hover:bg-cyan-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Usamos el emoji real dinámico que genera tu hook */}
                <i className={`${alert.emoji}`} style={{ fontSize: "20px" }} />
                
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-[12.5px] font-semibold text-white">
                      {alert.title}
                    </div>
                    {/* Badge de tiempo */}
                    <span className="text-[10px] text-slate-500 bg-black/20 px-1.5 py-0.5 rounded">
                      {alert.time}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] leading-5 text-slate-400">
                    {alert.description}
                  </div>
                </div>
              </div>

              {/* Botón para resolver la alerta en LocalStorage usando tu método original */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Evita que se dispare la redirección de la tarjeta al hacer clic en el botón
                  resolveAlert(alert.id);
                }}
                className="text-slate-500 hover:text-white transition-colors p-1"
                title="Marcar como resuelta"
              >
                ✕
              </button>
            </div>
          );
        })}

        {/* Mensaje de Fallback si todo está en orden */}
        {activeAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 border border-dashed border-white/5 rounded-[10px] bg-white/[0.01]">
            <span className="text-xl mb-1">✅</span>
            <p className="text-xs">Todo bajo control. No hay anomalías ni alertas pendientes.</p>
          </div>
        )}
      </div>
    </PageSection>
  );
}
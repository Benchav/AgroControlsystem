import { Alert } from "../entities/alert_model";

export const initialAlerts: Alert[] = [
  {
    id: 'A01',
    emoji: '🐛',
    title: 'Anomalía de presión — Posible plaga subterránea',
    description: 'Parcela Norte: Variación anormal en sensores S01, S03. Patrón consistente con actividad de roedores.',
    time: 'hace 12m',
    severity: 'red',
    resolved: false,
  },
  {
    id: 'A02',
    emoji: '🦗',
    title: 'Posible actividad de insectos — Sector 2A',
    description: 'Temperatura de suelo elevada con patrón de vibración en sensor S05. Monitoreo continuo activo.',
    time: 'hace 58m',
    severity: 'amber',
    resolved: false,
  },
];
import type { NavigationItem } from '../types/app';

export const navigation: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-th-large', section: 'principal' },
  { id: 'map', label: 'Mapa Interactivo', icon: 'fa-map-marked-alt', section: 'principal' },
  { id: 'iot', label: 'Sensores IoT', icon: 'fa-microchip', section: 'modulos',  },
  { id: 'ai', label: 'Diagnóstico IA', icon: 'fa-brain', section: 'modulos' },
  { id: 'chat', label: 'Asistente / Expertos', icon: 'fa-comments', section: 'modulos',  },
  { id: 'market', label: 'Subastas', icon: 'fa-store', section: 'modulos', }, //podemos agregar la propiedad badge para mostrar un indicador de notificaciones
  { id: 'modelos3d', label: 'Modelos 3D', icon: 'fa-cube', section: 'sistema' },
  { id: 'reportes', label: 'Reportes', icon: 'fa-chart-line', section: 'sistema' },
  { id: 'settings', label: 'Configuración', icon: 'fa-sliders-h', section: 'sistema' },
];
